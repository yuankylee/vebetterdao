import { useQuery } from "@tanstack/react-query"

import { getXAppMetadata } from "../getXAppMetadata"

import { useXApp } from "./useXApp"

export const getXAppMetadataQueryKey = (xAppId?: string, metadataURI?: string) =>
  metadataURI ? (["xAppMetadata", xAppId, metadataURI] as const) : (["xAppMetadata", xAppId] as const)

export const useXAppMetadata = (xAppId?: string, enabled = true) => {
  const { data: xApp } = useXApp(xAppId)
  const metadataURI = xApp?.metadataURI ?? ""

  return useQuery({
    queryKey: getXAppMetadataQueryKey(xAppId, metadataURI),
    queryFn: () => getXAppMetadata(metadataURI),
    enabled: enabled && !!xApp && !!metadataURI,
  })
}
