"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function WalletButton() {
  return (
    <ConnectButton
      accountStatus={{
        smallScreen: "avatar",
        largeScreen: "full",
      }}
      chainStatus={{ smallScreen: "none", largeScreen: "icon" }}
      showBalance={{ smallScreen: false, largeScreen: true }}
    />
  );
}
