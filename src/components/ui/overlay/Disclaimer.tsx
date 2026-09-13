"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { useDisclosure, useInterval, useLocalStorage } from "@mantine/hooks";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  ScrollShadow,
} from "@heroui/react";
import { DISCLAIMER_STORAGE_KEY, IS_BROWSER } from "@/utils/constants";
import { cn } from "@/utils/helpers";

const COUNTDOWN_DURATION = 10;
const MODAL_SIZE = "3xl";
const DISCLAIMER_CONTENT = {
  title: "SnapFlix Disclaimer & Terms",
  paragraphs: [
    {
      id: "welcome",
      content:
        "Welcome to SnapFlix - a private entertainment streaming catalog. Please read this disclaimer carefully before using this platform.",
    },
    {
      id: "purpose",
      content: "SnapFlix is a proprietary platform developed for",
      emphasis: "catalog discovery and media indexing.",
      continuation:
        "This platform is private and is not meant to promote or encourage digital piracy in any form.",
    },
    {
      id: "content-source",
      content:
        "All content displayed on SnapFlix (including but not limited to movies, images, posters, and related information) is sourced from",
      emphasis: "third-party providers through APIs or embedding.",
      continuation:
        "SnapFlix does not host, store, or distribute any media files on its servers. The platform merely indexes content that is available on the internet.",
    },
    {
      id: "responsibility",
      content:
        "By using SnapFlix, you acknowledge that SnapFlix bears no responsibility for user actions, content accuracy, or any direct or indirect damages arising from the use of this website. Users are solely responsible for their actions while using this service. Intellectual property rights are respected, and legitimate requests from copyright holders for content removal will be honored.",
    },
    {
      id: "usage",
      content:
        "Any unauthorized downloading, redistribution of content, or commercial reproduction is strictly prohibited. By using SnapFlix, you agree to these private terms and acknowledge that",
      emphasis: "you use the service under these terms.",
    },
  ],
};

interface DisclaimerParagraphProps {
  content: string;
  emphasis?: string;
  continuation?: string;
}

const DisclaimerParagraph: React.FC<DisclaimerParagraphProps> = memo(
  ({ content, emphasis, continuation }) => (
    <p>
      {content}
      {emphasis && (
        <>
          {" "}
          <strong>{emphasis}</strong>
        </>
      )}
      {continuation && ` ${continuation}`}
    </p>
  ),
);

DisclaimerParagraph.displayName = "DisclaimerParagraph";

const Disclaimer: React.FC = () => {
  const [hasAgreed, setHasAgreed] = useLocalStorage<boolean>({
    key: DISCLAIMER_STORAGE_KEY,
    defaultValue: false,
    getInitialValueInEffect: false,
  });

  const [secondsRemaining, setSecondsRemaining] = useState(COUNTDOWN_DURATION);

  const shouldShowModal = useMemo(() => !hasAgreed && IS_BROWSER, [hasAgreed]);

  const [isOpen, { close }] = useDisclosure(shouldShowModal);

  useInterval(() => setSecondsRemaining((prev) => Math.max(0, prev - 1)), 1000, {
    autoInvoke: shouldShowModal && secondsRemaining > 0,
  });

  const isButtonDisabled = secondsRemaining > 0;
  const buttonText = useMemo(
    () => `Agree${isButtonDisabled ? ` (${secondsRemaining})` : ""}`,
    [isButtonDisabled, secondsRemaining],
  );

  const handleAgree = useCallback(() => {
    close();
    setHasAgreed(true);
  }, [close, setHasAgreed]);

  if (hasAgreed || !IS_BROWSER) {
    return null;
  }

  return (
    <Modal
      hideCloseButton
      isOpen={isOpen}
      placement="center"
      backdrop="blur"
      size={MODAL_SIZE}
      isDismissable={false}
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-center text-3xl uppercase">
          {DISCLAIMER_CONTENT.title}
        </ModalHeader>

        <ModalBody>
          <ScrollShadow hideScrollBar className="space-y-4">
            {DISCLAIMER_CONTENT.paragraphs.map((paragraph) => (
              <DisclaimerParagraph
                key={paragraph.id}
                content={paragraph.content}
                emphasis={paragraph.emphasis}
                continuation={paragraph.continuation}
              />
            ))}
          </ScrollShadow>
        </ModalBody>

        <ModalFooter className="justify-center">
          <Button
            className={cn(isButtonDisabled && "pointer-events-auto cursor-not-allowed")}
            isDisabled={isButtonDisabled}
            color={isButtonDisabled ? "danger" : "primary"}
            variant="shadow"
            onPress={handleAgree}
          >
            {buttonText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default Disclaimer;
