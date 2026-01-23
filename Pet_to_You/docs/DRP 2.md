# 🔧 Pet to You - Disaster Recovery Plan (DRP)

**Document Version**: 1.0.0
**Last Updated**: 2025-12-30
**Next Review**: 2026-03-31 (Quarterly)
**Owner**: CISO + DevOps Lead

---

## 🎯 Recovery Objectives

**RTO**: 4 hours (Critical services)
**RPO**: 1 hour (Medical/Insurance data)

**Recovery Priorities**:
1. Medical records access (의료법 compliance)
2. Emergency appointment booking
3. Insurance claims processing
4. User authentication
5. General services

---

## 🗄️ Backup Architecture

### PostgreSQL (Critical Data)

**Backup Strategy**:
```
Primary: AWS RDS Automated Backups
  ├─ Continuous: WAL archiving to S3 (1-min RPO)
  ├─ Automated snapshots: Daily (30-day retention)
  └─ Manual snapshots: Before major changes

Backup Storage:
  ├─ Same region: S3 (default)
  ├─ Cross-region: S3 ap-northeast-1 (DR)
  └─ On-premises: Weekly tape backup (compliance)

Encryption: AES-256 at rest, TLS 1.3 in transit
```

**Recovery Methods**:
1. **Point-in-Time Recovery** (PITR): Restore to any second in last 30 days
2. **Snapshot Restore**: Restore from daily snapshot (fastest)
3. **Cross-region**: Failover to Seoul backup (ap-northeast-1)

---

### MongoDB (Search & Content)

**Backup Strategy**:
```
MongoDB Atlas Continuous Backup:
  ├─ Point-in-time: Any moment in last 24 hours
  ├─ Daily snapshots: 30-day retention
  └─ Weekly snapshots: 90-day retention

Cross-region replication:
  ├─ Primary: ap-northeast-2 (Seoul)
  └─ Replica: ap-northeast-1 (Tokyo)
```

**Recovery**: Automated restore via Atlas UI (15 minutes)

---

### Redis (Cache & Sessions)

**Backup Strategy**:
```
RDB Snapshots: Every 6 hours
AOF: Disabled (non-critical data)

Recovery: Not required (cache rebuilt from databases)
```

---

### File Storage (R2/S3)

**Backup Strategy**:
```
Versioning: Enabled (all objects)
Cross-region replication: Enabled
Lifecycle:
  ├─ Medical documents: NEVER delete (의료법)
  ├─ Insurance docs: 5 years (보험업법)
  └─ General files: 90 days

Disaster recovery:
  ├─ All files automatically replicated
  └─ No action needed (S3 durability: 99.999999999%)
```

---

## 🚀 Recovery Procedures

### Procedure 1: PostgreSQL Database Recovery

#### Option A: Point-in-Time Recovery (Fastest for recent failures)

**Time**: 30-60 minutes
**Data Loss**: <5 minutes (WAL replay)

**Steps**:
```bash
# 1. Identify target recovery time
TARGET_TIME="2025-12-30 14:30:00+09"

# 2. Create new instance from PITR
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier pet-to-you-primary \
  --target-db-instance-identifier pet-to-you-recovery \
  --restore-time "$TARGET_TIME" \
  --db-instance-class db.t3.medium \
  --availability-zone ap-northeast-2a

# 3. Wait for restoration (15-30 min)
aws rds wait db-instance-available \
  --db-instance-identifier pet-to-you-recovery

# 4. Update application connection string
kubectl set env deployment/api \
  DATABASE_URL="postgresql://...pet-to-you-recovery..."

# 5. Verify data integrity
psql -h pet-to-you-recovery... -c "SELECT COUNT(*) FROM users;"
psql -h pet-to-you-recovery... -c "SELECT MAX(created_at) FROM health_notes;"

# 6. Resume normal operations
kubectl rollout restart deployment/api

# 7. Monitor for issues
kubectl logs -f deployment/api
```

#### Option B: Snapshot Restore (For older failures)

**Time**: 1-2 hours
**Data Loss**: Up to 24 hours (last daily snapshot)

**Steps**:
```bash
# 1. List available snapshots
aws rds describe-db-snapshots \
  --db-instance-identifier pet-to-you-primary

# 2. Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier pet-to-you-restored \
  --db-snapshot-identifier daily-backup-2025-12-29

# 3. Wait and verify
aws rds wait db-instance-available --db-instance-identifier pet-to-you-restored

# 4. Update application
# (same as PITR steps 4-7)
```

---

### Procedure 2: MongoDB Recovery

**Atlas UI Method** (Recommended):

```
1. Login to MongoDB Atlas
2. Clusters → pet-to-you-prod → Backup
3. Select recovery point
4. Click "Restore"
5. Choose:
   - "Restore to same cluster" (production restore)
   - "Restore to new cluster" (testing)
6. Confirm and wait (10-30 min)
7. Update connection string in app
8. Verify data
```

**CLI Method**:
```bash
# Using Atlas CLI
atlas backups restores start \
  --clusterName pet-to-you-prod \
  --targetClusterName pet-to-you-restored \
  --pointInTimeUTCSeconds 1735542000
```

---

### Procedure 3: Complete Infrastructure Rebuild

**Scenario**: Total infrastructure loss (worst case)

**Time**: 4-8 hours
**Prerequisites**: Terraform state and backup files available

**Steps**:

#### Phase 1: Infrastructure (1-2 hours)

```bash
# 1. Clone infrastructure repository
git clone https://github.com/pet-to-you/infrastructure.git
cd infrastructure/terraform

# 2. Initialize Terraform
terraform init -backend-config="bucket=pet-to-you-tfstate"

# 3. Apply infrastructure
terraform apply \
  -var="environment=dr" \
  -var="region=ap-northeast-2"

# Provisions:
# - VPC with 3 subnets (DMZ, Service, Sensitive)
# - RDS PostgreSQL (3 instances)
# - MongoDB Atlas cluster
# - ElastiCache Redis
# - S3/R2 buckets
# - CloudFront + WAF
# - Load balancers
```

#### Phase 2: Database Restore (2-3 hours)

```bash
# PostgreSQL
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier pet-to-you-dr-postgres-sensitive \
  --db-snapshot-identifier latest-sensitive-backup

# MongoDB
atlas backups restores start --clusterName pet-to-you-dr

# Verify
psql -h dr-postgres... -c "SELECT version();"
mongosh "mongodb+srv://dr-cluster..." --eval "db.version()"
```

#### Phase 3: Application Deployment (1-2 hours)

```bash
# 1. Build Docker images
docker build -t pet-to-you/api:dr ./apps/api

# 2. Push to registry
docker push pet-to-you/api:dr

# 3. Deploy with Kubernetes
kubectl apply -f k8s/dr-deployment.yml

# 4. Wait for pods to be ready
kubectl rollout status deployment/api

# 5. Run smoke tests
npm run test:e2e:smoke
```

#### Phase 4: Verification (30 min - 1 hour)

```bash
# Health checks
curl https://api.pet-to-you.com/health
curl https://api.pet-to-you.com/health/db

# Critical API tests
curl https://api.pet-to-you.com/api/v1/hospitals
curl -H "Authorization: Bearer $TEST_TOKEN" \
  https://api.pet-to-you.com/api/v1/users/me

# Database integrity
npm run db:verify-integrity

# Security checks
npm run security:scan
```

#### Phase 5: Go Live (30 min)

```bash
# 1. Update DNS
aws route53 change-resource-record-sets \
  --hosted-zone-id Z123456 \
  --change-batch file://dns-update.json

# 2. Monitor traffic
watch -n 5 'kubectl top pods'

# 3. Enable auto-scaling
kubectl autoscale deployment api --min=3 --max=10 --cpu-percent=70

# 4. Announce recovery
# Send email to all users
```

---

## 🔐 Data Integrity Verification

### Post-Recovery Checks

**Database Counts**:
```sql
-- PostgreSQL
SELECT 'users' AS table_name, COUNT(*) FROM users
UNION ALL
SELECT 'pets', COUNT(*) FROM pets
UNION ALL
SELECT 'health_notes', COUNT(*) FROM health_notes
UNION ALL
SELECT 'insurance_claims', COUNT(*) FROM insurance_claims;

-- Expected counts (from last backup report)
-- users: ~50,000
-- pets: ~75,000
-- health_notes: ~100,000
-- insurance_claims: ~10,000
```

**MongoDB Collections**:
```javascript
// MongoDB
db.hospitals.countDocuments()    // ~5,000
db.reviews.countDocuments()      // ~50,000
db.daycares.countDocuments()     // ~1,000
```

**Encryption Validation**:
```sql
-- Verify all sensitive fields are encrypted
SELECT id FROM health_notes
WHERE diagnosis_encrypted IS NULL
  AND diagnosis IS NOT NULL;

-- Should return 0 rows
```

**Audit Log Chain**:
```sql
-- Verify hash chain integrity
SELECT id FROM audit_logs
WHERE hash IS NULL OR previous_hash IS NULL
LIMIT 10;

-- Should return 0 rows
```

---

## 📞 Escalation Path

### Level 1: DevOps Team (0-30 min)
- Initial response
- Execute standard procedures
- Attempt recovery

### Level 2: Engineering Lead (30 min - 2 hr)
- Complex issues
- Architecture decisions
- Resource allocation

### Level 3: CISO (2-4 hr)
- Security implications
- Compliance issues
- Regulatory notification

### Level 4: CEO (>4 hr or major breach)
- Business impact
- Public communication
- Strategic decisions

---

## 🧪 DR Drill Results (Template)

### Drill Date: [YYYY-MM-DD]

**Scenario**: [Description]

**Metrics**:
| Objective | Target | Actual | Status |
|-----------|--------|--------|--------|
| Detection Time | <5 min | - | - |
| Team Mobilization | <15 min | - | - |
| Service Degradation | <30 min | - | - |
| Full Recovery | <4 hr | - | - |
| Data Loss | <1 hr | - | - |

**Issues Found**:
1. [Issue description]
2. [Issue description]

**Actions Taken**:
1. [Action item]
2. [Action item]

**Document Updates**:
- [ ] Update recovery time estimates
- [ ] Add new procedures
- [ ] Update contact list

---

## 🎯 Continuous Improvement

### After Each Incident

1. **Post-Mortem Meeting** (within 48 hours)
   - What happened
   - What went well
   - What can improve
   - Action items

2. **Documentation Update** (within 1 week)
   - Update DRP with new procedures
   - Record actual RTO/RPO
   - Add new scenarios

3. **Training** (within 2 weeks)
   - Share learnings with team
   - Update runbooks
   - Practice new procedures

### Quarterly Reviews

- Review all recovery procedures
- Update contact information
- Test backup restores
- Measure against RTO/RPO targets
- Update risk assessment

---

**This DRP is tested quarterly and updated based on real incidents and drill results.**
