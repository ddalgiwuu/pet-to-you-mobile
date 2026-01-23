# 🏢 Pet to You - Business Continuity Plan (BCP)

**Document Version**: 1.0.0
**Last Updated**: 2025-12-30
**Next Review**: 2026-03-31 (Quarterly)
**Owner**: CISO (To be designated)

---

## 🎯 Purpose

Ensure Pet to You services remain operational during disruptions and can be restored quickly after disasters.

**Critical Business Functions**:
1. 병원 예약 서비스 (Appointments)
2. 의료 기록 접근 (Medical Records)
3. 보험 청구 처리 (Insurance Claims)
4. 긴급 수의사 연결 (Emergency Vet Matching)

**Maximum Acceptable Downtime**: 4 hours (Critical services)

---

## 📊 Recovery Objectives

### RTO (Recovery Time Objective)

| Service Level | RTO | Services |
|---------------|-----|----------|
| **Critical** | 4 hours | Medical records, Emergency bookings |
| **High** | 12 hours | Appointments, Insurance claims |
| **Medium** | 24 hours | Reviews, User profiles |
| **Low** | 72 hours | Analytics, Reports |

### RPO (Recovery Point Objective)

| Data Type | RPO | Backup Frequency |
|-----------|-----|------------------|
| **Medical Records** | 1 hour | Continuous (WAL) + Hourly snapshot |
| **Insurance Claims** | 1 hour | Continuous (WAL) + Hourly snapshot |
| **User Data** | 4 hours | Every 4 hours |
| **Transactional Data** | 4 hours | Every 4 hours |
| **MongoDB Data** | 24 hours | Daily |

**Maximum Data Loss**:
- Medical/Insurance: 1 hour
- Critical transactions: 4 hours
- General data: 24 hours

---

## 🚨 Disaster Scenarios

### Scenario 1: Database Failure

**Event**: PostgreSQL primary database fails

**Impact**:
- Medical records inaccessible
- Appointments cannot be booked
- User login affected

**Recovery**:
1. **Immediate (0-15 min)**:
   - Automatic failover to read replica
   - Display read-only mode banner
   - Alert CISO and DevOps team

2. **Short-term (15min-2hr)**:
   - Promote read replica to primary
   - Restore write operations
   - Verify data integrity

3. **Long-term (2-4hr)**:
   - Create new replica
   - Resume normal operations
   - Post-mortem analysis

**Commands**:
```bash
# Promote replica to primary
aws rds promote-read-replica --db-instance-identifier pet-to-you-replica

# Update connection string
kubectl set env deployment/api DATABASE_URL=postgresql://...replica

# Verify
psql -h replica.pet-to-you.com -U postgres -c "SELECT 1"
```

---

### Scenario 2: API Server Crash

**Event**: All API servers down

**Impact**:
- Complete service outage
- No user access
- Emergency: Cannot book urgent vet appointments

**Recovery**:
1. **Immediate (0-5 min)**:
   - Auto-scaling triggers new instances
   - Load balancer health checks fail → Route to backup region
   - Alert DevOps team

2. **Short-term (5-30 min)**:
   - New instances start
   - Health checks pass
   - Resume normal traffic

3. **Long-term (30min-2hr)**:
   - Identify crash cause
   - Deploy hotfix
   - Monitor stability

**Commands**:
```bash
# Manual restart (if auto-scaling fails)
kubectl rollout restart deployment/api

# Check pod status
kubectl get pods -l app=api

# View logs
kubectl logs -f deployment/api --tail=100
```

---

### Scenario 3: Network Intrusion

**Event**: Hacker gains access to Service zone

**Impact**:
- User data potentially compromised
- System integrity questioned
- Legal breach notification required

**Recovery**:
1. **Immediate (0-30 min)**:
   - Isolate compromised systems
   - Block attacker IPs (automatic)
   - Enable read-only mode
   - Alert CISO

2. **Short-term (30min-4hr)**:
   - Forensic analysis
   - Identify affected data
   - Patch vulnerability
   - Create SecurityIncident record

3. **Medium-term (4-24hr)**:
   - Notify MOHW (if medical data)
   - Notify PIPC/KISA
   - Notify affected users
   - Restore services

4. **Long-term (24-72hr)**:
   - Submit compliance reports
   - Implement additional security
   - Security audit
   - Public communication

**Commands**:
```bash
# Isolate affected pods
kubectl scale deployment/api --replicas=0

# Deploy clean version
kubectl apply -f k8s/api-deployment.yml

# Verify integrity
npm run security:scan
```

---

### Scenario 4: Data Center Outage

**Event**: AWS ap-northeast-2 region failure

**Impact**:
- Complete service outage
- All databases inaccessible

**Recovery**:
1. **Immediate (0-30 min)**:
   - Failover to backup region (ap-northeast-1 or ap-southeast-1)
   - DNS cutover
   - Alert all stakeholders

2. **Short-term (30min-2hr)**:
   - Restore from latest backups
   - Verify data consistency
   - Resume critical services only

3. **Medium-term (2-8hr)**:
   - Full service restoration
   - Data validation
   - User communication

4. **Long-term (8-24hr)**:
   - Sync with primary region when available
   - Failback to primary
   - Post-mortem

**Commands**:
```bash
# Update Route53 DNS
aws route53 change-resource-record-sets \
  --hosted-zone-id Z123 \
  --change-batch file://failover-dns.json

# Restore from backup
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier pet-to-you-dr \
  --db-snapshot-identifier daily-backup-2025-12-30
```

---

### Scenario 5: Key Personnel Unavailable

**Event**: CISO or lead engineer unavailable

**Impact**:
- Security decisions delayed
- Incident response slower

**Recovery**:
1. **Immediate**:
   - Activate backup personnel
   - Follow documented procedures
   - Escalate to CEO if needed

2. **Short-term**:
   - Delegate responsibilities
   - Cross-train team members

**Succession Plan**:
```
CISO unavailable:
  1st: Senior Security Engineer
  2nd: CTO
  3rd: External security consultant

Lead Engineer unavailable:
  1st: Senior Backend Engineer
  2nd: DevOps Lead
  3rd: External contractor
```

---

## 📞 Emergency Contact List

### Internal Team

| Role | Primary | Backup | Phone | Email |
|------|---------|--------|-------|-------|
| **CISO** | [TBD] | CTO | +82-10-XXXX-XXXX | ciso@pet-to-you.com |
| **DevOps Lead** | [TBD] | Backend Lead | +82-10-XXXX-XXXX | devops@pet-to-you.com |
| **Backend Lead** | [TBD] | Senior Engineer | +82-10-XXXX-XXXX | backend@pet-to-you.com |
| **CEO** | [TBD] | COO | +82-10-XXXX-XXXX | ceo@pet-to-you.com |

### External Contacts

| Service | Contact | Purpose |
|---------|---------|---------|
| **AWS Support** | Enterprise 24/7 | Infrastructure issues |
| **MongoDB Atlas** | Support portal | Database issues |
| **Cloudflare** | 24/7 support | CDN/R2 issues |
| **Security Consultant** | [External firm] | Breach response |
| **Legal Counsel** | [Law firm] | Compliance issues |

### Regulatory Authorities

| Authority | Contact | Purpose |
|-----------|---------|---------|
| **MOHW** | 129 | Medical data breaches |
| **PIPC** | 118 | Personal info breaches |
| **KISA** | 118 | Cyber incidents |
| **FSC** | 1332 | Insurance incidents |

---

## 🔄 Business Continuity Procedures

### Daily Operations

**Normal Mode**:
- All 3 zones operational (DMZ, Service, Sensitive)
- Auto-scaling enabled
- Monitoring active (Wazuh + CloudWatch)

**Degraded Mode** (partial outage):
- Critical services only
- Read-only mode for non-critical features
- User notification: "Limited functionality"

**Emergency Mode** (major outage):
- Static emergency page
- Contact information displayed
- Status updates via social media

---

### Communication Plan

**Internal Communication**:
1. Slack #incidents (immediate)
2. Email to all engineering (within 15 min)
3. All-hands call if CRITICAL (within 30 min)

**External Communication**:
- **Users**: In-app notification + Email + Push notification
- **Partners**: Direct email to hospital/daycare admins
- **Media**: Press release (if major incident)
- **Regulators**: Official notification (MOHW/PIPC/KISA)

**Templates**:
```
Subject: [긴급] Pet to You 서비스 일시 중단 안내

고객님께,

현재 시스템 장애로 인해 서비스가 일시 중단되었습니다.

- 발생 시간: {timestamp}
- 예상 복구: {estimate}
- 영향 범위: {services}

긴급한 경우:
- 전화: 1234-5678 (24시간 운영)
- 이메일: emergency@pet-to-you.com

불편을 드려 죄송합니다.
Pet to You 드림
```

---

## 🧪 Testing & Drills

### Quarterly DR Drills

**Q1**: Database failover test
**Q2**: Multi-zone outage simulation
**Q3**: Breach response drill
**Q4**: Full disaster recovery

**Drill Procedure**:
1. Schedule with team (non-business hours)
2. Execute failover
3. Measure RTO/RPO
4. Document lessons learned
5. Update procedures

### Annual Tests

- Full region failover
- Data restoration from cold backup
- Complete infrastructure rebuild
- Regulatory breach notification drill

---

## 📋 Checklist: Disaster Response

### Immediate (0-15 min)

- [ ] Identify incident type
- [ ] Alert CISO and DevOps
- [ ] Activate incident command center
- [ ] Enable degraded mode if needed
- [ ] Log incident start time

### Short-term (15min-2hr)

- [ ] Assess impact and scope
- [ ] Execute recovery procedures
- [ ] Communicate with users
- [ ] Monitor recovery progress
- [ ] Verify data integrity

### Medium-term (2-24hr)

- [ ] Full service restoration
- [ ] User communication (all clear)
- [ ] Regulatory notification (if required)
- [ ] Begin root cause analysis

### Long-term (24-72hr)

- [ ] Post-mortem meeting
- [ ] Update documentation
- [ ] Implement preventive measures
- [ ] Submit compliance reports
- [ ] Public communication (if needed)

---

## 📊 Success Metrics

### Recovery Performance

**Target**:
- Critical services: <4hr RTO, <1hr RPO
- High priority: <12hr RTO, <4hr RPO

**Measurement**:
- Time to detection: <5 minutes
- Time to containment: <30 minutes
- Time to recovery: <RTO
- Data loss: <RPO

**2025 Targets**:
- 99.9% uptime (8.7 hours downtime/year)
- <3 incidents requiring BCP activation
- 100% successful DR drills
- 0 compliance violations

---

## 🔧 Backup Strategy

### Automated Backups

**PostgreSQL** (Continuous + Snapshots):
```
Continuous: WAL archiving to S3 (1-minute RPO)
Snapshots:
  - Hourly (24 hours retention)
  - Daily (30 days retention)
  - Weekly (90 days retention)
  - Monthly (5 years retention for insurance data)
```

**MongoDB** (Point-in-Time):
```
Atlas Continuous Backup:
  - Point-in-time recovery (any point in last 24 hours)
  - Daily snapshots (30 days retention)
```

**Redis** (Optional):
```
RDB snapshots: Every 6 hours
AOF: Disabled (cache only, no critical data)
```

**File Storage (R2/S3)**:
```
Versioning: Enabled (immutable medical documents)
Lifecycle:
  - Medical docs: Never delete (의료법)
  - General files: 90 days
```

---

## 📚 Related Documents

- `docs/DRP.md` - Disaster Recovery detailed procedures
- `docs/SECURITY.md` - Security architecture
- `docs/NETWORK-ARCHITECTURE.md` - Network topology
- `infrastructure/wazuh/detection-rules.yml` - Incident detection

---

**This BCP is reviewed quarterly and updated after each drill or real incident.**
