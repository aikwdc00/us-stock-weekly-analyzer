"use client";

import { useEffect, useMemo, useState } from "react";

export function useValuationModel(quote) {
  const [selectedModel, setSelectedModel] = useState(quote.valuationModels?.[0]?.label || "");

  useEffect(() => {
    setSelectedModel(quote.valuationModels?.[0]?.label || "");
  }, [quote.symbol, quote.valuationModels]);

  const activeModel = useMemo(
    () => quote.valuationModels?.find((model) => model.label === selectedModel) || quote.valuationModels?.[0],
    [quote.valuationModels, selectedModel]
  );

  return {
    selectedModel,
    setSelectedModel,
    activeModel
  };
}
