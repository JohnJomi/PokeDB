import { DeviceShell } from "@/components/device/DeviceShell";
import { LcdScreen } from "@/components/device/LcdScreen";
import { TitleBar } from "@/components/device/TitleBar";
import { DialogBox } from "@/components/ui/DialogBox";
import { PixelLink } from "@/components/ui/PixelButton";

export default function NotFound() {
  return (
    <DeviceShell title="✖ NO SIGNAL">
      <LcdScreen aria-label="Not found">
        <TitleBar title="ERROR" value="404" />
        <DialogBox>A wild MISSING PAGE appeared! There is no entry at this address.</DialogBox>
      </LcdScreen>
      <PixelLink tone="yellow" href="/">Back to index</PixelLink>
    </DeviceShell>
  );
}
