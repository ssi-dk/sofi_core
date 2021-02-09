import {
  SingleUploadRequest,
  singleUpload,
  MultiUploadRequest,
  multiUpload,
} from "sap-client";
import { getUrl } from "service";

export const uploadIsolateFile = (req: SingleUploadRequest) => {
  const base = singleUpload<void>(req);
  base.url = getUrl(base.url);
  const formData = new FormData();
  if (req.metadata !== undefined) {
    formData.append(
      "metadata",
      new Blob([JSON.stringify(req.metadata as any)], {
        type: "application/json",
      })
    );
  }

  if (req.file !== undefined) {
    formData.append("file", req.file as any);
  }

  base.body = formData;
  return base;
};

export const uploadMultipleIsolates = (req: MultiUploadRequest) => {
  const tempreq = {...req, files: []}
  const base = multiUpload<void>(tempreq);
  base.url = getUrl(base.url);

  const formData = new FormData();
  if (req.metadataTsv !== undefined) {
    formData.append("metadata_tsv", req.metadataTsv as any);
  }

  if (req.files) {
    [...req.files].forEach((element) => {
      formData.append("files", element as any);
    });
  }

  base.body = formData;
  return base;
};
