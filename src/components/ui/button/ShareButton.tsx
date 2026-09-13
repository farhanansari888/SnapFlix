"use client";

import IconButton from "./IconButton";
import VaulDrawer from "@/components/ui/overlay/VaulDrawer";
import {
  WhatsappShareButton,
  WhatsappIcon,
  TwitterShareButton,
  XIcon,
  LinkedinShareButton,
  LinkedinIcon,
  FacebookIcon,
  FacebookShareButton,
  LineShareButton,
  LineIcon,
  RedditIcon,
  RedditShareButton,
  EmailIcon,
  EmailShareButton,
  TelegramIcon,
  TelegramShareButton,
} from "react-share";
import { Divider } from "@heroui/react";
import CopyButton from "./CopyButton";
import { ContentType } from "@/types";
import { Share } from "@/utils/icons";
import { useDisclosure } from "@mantine/hooks";

interface ShareButtonProps {
  title: string;
  id: string | number;
  type?: ContentType;
}

const HASTAGS = ["snapflix", "movies", "streaming", "entertainment"];

const SHARE_BUTTONS = [
  {
    label: "Facebook",
    Icon: FacebookIcon,
    Component: FacebookShareButton,
  },
  {
    label: "WhatsApp",
    Icon: WhatsappIcon,
    Component: WhatsappShareButton,
  },
  {
    label: "X (Twitter)",
    Icon: XIcon,
    Component: TwitterShareButton,
  },
  {
    label: "LinkedIn",
    Icon: LinkedinIcon,
    Component: LinkedinShareButton,
  },
  {
    label: "Line",
    Icon: LineIcon,
    Component: LineShareButton,
  },
  {
    label: "Telegram",
    Icon: TelegramIcon,
    Component: TelegramShareButton,
  },
  {
    label: "Reddit",
    Icon: RedditIcon,
    Component: RedditShareButton,
  },
  {
    label: "Email",
    Icon: EmailIcon,
    Component: EmailShareButton,
  },
];

const ShareButton: React.FC<ShareButtonProps> = ({ title, id, type = "movie" }) => {
  const url = `https://${location.hostname}/${type}/${id}`;
  const description = `Watch and stream ${title} on SnapFlix!`;

  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <IconButton icon={<Share size={20} />} variant="ghost" tooltip="Share" onPress={open} />
      <VaulDrawer open={opened} onClose={close} backdrop="blur" title="Share via">
        <div className="space-y-8 px-6">
          <div className="grid grid-cols-4 gap-x-5 gap-y-3 md:gap-x-10 md:gap-y-5">
            {SHARE_BUTTONS.map(({ Component, Icon, label }) => (
              <Component
                key={label}
                title={description}
                hashtags={HASTAGS}
                url={url}
                subject={description}
                onClick={close}
                className="flex flex-col items-center justify-center gap-2"
              >
                <Icon className="rounded-md" size={45} />
                <span className="text-xs">{label}</span>
              </Component>
            ))}
          </div>
        </div>
        <Divider className="my-4" />
        <div className="space-y-4 px-6">
          <CopyButton
            text={url}
            label="Copy Link"
            copiedLabel="Link copied to clipboard!"
            onCopied={close}
          />
        </div>
      </VaulDrawer>
    </>
  );
};

export default ShareButton;
