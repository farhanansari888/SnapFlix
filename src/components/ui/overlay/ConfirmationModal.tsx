import { OverlayProps } from "@/types/component";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";

interface ConfirmationModalProps extends OverlayProps {
  title: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isLoading,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      backdrop="blur"
      isDismissable={!isLoading}
      hideCloseButton={isLoading}
    >
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>{children}</ModalBody>
        <ModalFooter>
          <Button
            color="danger"
            variant="light"
            onPress={() => {
              onCancel?.();
              onClose();
            }}
          >
            {cancelLabel}
          </Button>
          <Button color="primary" onPress={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmationModal;
