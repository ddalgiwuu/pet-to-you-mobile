/**
 * Document Gallery Component
 * Grid layout for displaying medical documents with preview and delete
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MedicalRecord } from '@/types';
import { theme } from '@/constants/theme';

interface Props {
  documents: MedicalRecord['documents'];
  onDelete?: (documentId: string) => void;
  editable?: boolean;
}

export default function DocumentGallery({ documents = [], onDelete, editable = false }: Props) {
  const [previewDocument, setPreviewDocument] = useState<MedicalRecord['documents'][0] | null>(
    null
  );

  if (!documents || documents.length === 0) {
    return null;
  }

  const getDocumentIcon = (type: MedicalRecord['documents'][0]['type']) => {
    const icons = {
      receipt: 'receipt',
      medical_record: 'document-text',
      diagnosis: 'clipboard',
      prescription: 'fitness',
      xray: 'scan',
      lab_result: 'flask',
      photo: 'image',
      other: 'document',
    };
    return icons[type] || 'document';
  };

  const getDocumentColor = (type: MedicalRecord['documents'][0]['type']) => {
    const colors = {
      receipt: theme.colors.primary,
      medical_record: theme.colors.info,
      diagnosis: theme.colors.warning,
      prescription: theme.colors.success,
      xray: theme.colors.purple,
      lab_result: theme.colors.orange,
      photo: theme.colors.pink,
      other: theme.colors.gray600,
    };
    return colors[type] || theme.colors.gray600;
  };

  const isImageFile = (mimeType: string) => {
    return mimeType.startsWith('image/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {documents.map((doc) => {
          const iconName = getDocumentIcon(doc.type);
          const iconColor = getDocumentColor(doc.type);
          const isImage = isImageFile(doc.mimeType);

          return (
            <TouchableOpacity
              key={doc.id}
              style={styles.documentCard}
              onPress={() => setPreviewDocument(doc)}
              activeOpacity={0.7}
            >
              {isImage ? (
                <Image source={{ uri: doc.uri }} style={styles.thumbnail} resizeMode="cover" />
              ) : (
                <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
                  <Ionicons name={iconName as any} size={32} color={iconColor} />
                </View>
              )}

              <View style={styles.documentInfo}>
                <Text style={styles.documentName} numberOfLines={1}>
                  {doc.name}
                </Text>
                <Text style={styles.documentSize}>
                  {(doc.size / 1024 / 1024).toFixed(1)}MB
                </Text>
              </View>

              {editable && onDelete && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    onDelete(doc.id);
                  }}
                >
                  <Ionicons name="close-circle" size={24} color={theme.colors.error} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Preview Modal */}
      <Modal
        visible={previewDocument !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewDocument(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setPreviewDocument(null)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {previewDocument?.name}
              </Text>
              <TouchableOpacity onPress={() => setPreviewDocument(null)}>
                <Ionicons name="close" size={28} color={theme.colors.white} />
              </TouchableOpacity>
            </View>

            {previewDocument && isImageFile(previewDocument.mimeType) ? (
              <Image
                source={{ uri: previewDocument.uri }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.previewPlaceholder}>
                <Ionicons
                  name={getDocumentIcon(previewDocument?.type || 'other') as any}
                  size={64}
                  color={theme.colors.white}
                />
                <Text style={styles.previewPlaceholderText}>
                  {previewDocument?.mimeType === 'application/pdf'
                    ? 'PDF 파일'
                    : '미리보기 불가'}
                </Text>
                <Text style={styles.previewPlaceholderSubtext}>
                  파일을 다운로드하여 확인하세요
                </Text>
              </View>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  documentCard: {
    width: '48%',
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  thumbnail: {
    width: '100%',
    height: 120,
    backgroundColor: theme.colors.gray100,
  },
  iconContainer: {
    width: '100%',
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentInfo: {
    padding: 12,
  },
  documentName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.gray900,
    marginBottom: 4,
  },
  documentSize: {
    fontSize: 11,
    color: theme.colors.gray500,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.gray900,
    marginBottom: 12,
  },
  breakdownList: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  breakdownLabel: {
    fontSize: 15,
    color: theme.colors.gray700,
  },
  breakdownValue: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.gray900,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 12,
    borderTopWidth: 2,
    borderTopColor: theme.colors.gray200,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.gray900,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  serviceList: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray100,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.gray900,
  },
  insuranceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: theme.colors.successLight,
    borderRadius: 6,
  },
  insuranceBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.success,
  },
  serviceDetail: {
    fontSize: 13,
    color: theme.colors.gray500,
  },
  serviceTotal: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primary,
    marginLeft: 12,
  },
  paymentSummary: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: theme.colors.gray600,
  },
  paymentValue: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.gray900,
  },
  paymentValueSuccess: {
    color: theme.colors.success,
  },
  finalPaymentRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray200,
    paddingTop: 12,
    marginTop: 4,
  },
  finalPaymentLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.gray900,
  },
  finalPaymentValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray100,
  },
  paymentMethodText: {
    fontSize: 13,
    color: theme.colors.gray600,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: theme.colors.gray100,
    borderRadius: 6,
  },
  statusBadgeCompleted: {
    backgroundColor: theme.colors.successLight,
  },
  statusBadgePartial: {
    backgroundColor: theme.colors.warningLight,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.gray600,
  },
  statusTextCompleted: {
    color: theme.colors.success,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  modalTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
    marginRight: 16,
  },
  previewImage: {
    width: '100%',
    height: 400,
  },
  previewPlaceholder: {
    width: '100%',
    height: 400,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  previewPlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.white,
  },
  previewPlaceholderSubtext: {
    fontSize: 14,
    color: theme.colors.gray400,
  },
});
