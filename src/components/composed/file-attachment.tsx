import { RiCloseLine, RiFileLine } from "@remixicon/react";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { Spinner } from "@/components/ui/spinner";
import { formatFileSize } from "@/lib/formatters";

interface FileAttachmentProps {
  name: string;
  size?: number;
  status?: "idle" | "uploading" | "processing" | "error" | "done";
  errorMessage?: string;
  onRemove?: () => void;
}

function FileAttachment({
  name,
  size,
  status = "done",
  errorMessage,
  onRemove,
}: FileAttachmentProps) {
  return (
    <Attachment state={status}>
      <AttachmentMedia>
        {status === "uploading" || status === "processing" ? (
          <Spinner className="size-4" />
        ) : (
          <RiFileLine className="size-4" />
        )}
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{name}</AttachmentTitle>
        <AttachmentDescription>
          {status === "error"
            ? (errorMessage ?? "Upload failed")
            : size != null
              ? formatFileSize(size)
              : null}
        </AttachmentDescription>
      </AttachmentContent>
      {onRemove && (
        <AttachmentActions>
          <AttachmentAction aria-label="Remove attachment" onClick={onRemove}>
            <RiCloseLine className="size-4" />
          </AttachmentAction>
        </AttachmentActions>
      )}
    </Attachment>
  );
}

export type { FileAttachmentProps };
export { FileAttachment };
