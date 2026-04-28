"use client";

import {
  AssetClassForm,
  assetAllocsToItems,
  itemsToAssetAllocs,
} from "./asset-allocation-editor";
import type { AssetClassKey, AssetClassAlloc } from "./stepper-types";

interface Step2Props {
  capital: number;
  assetAllocs: Record<AssetClassKey, AssetClassAlloc>;
  setAssetAllocs: (a: Record<AssetClassKey, AssetClassAlloc>) => void;
}

export function Step2AssetClasses({ capital, assetAllocs, setAssetAllocs }: Step2Props) {
  return (
    <AssetClassForm
      capital={capital}
      items={assetAllocsToItems(assetAllocs)}
      onChange={(next) => setAssetAllocs(itemsToAssetAllocs(next))}
    />
  );
}
