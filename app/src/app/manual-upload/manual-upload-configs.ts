import { QueryConfig } from "redux-query";
import {
  SingleUploadRequest,
  singleUpload,
  MultiUploadRequest,
  multiUpload,
  BulkMetadataRequest,
  bulkMetadata,
  UploadResponse,
} from "sap-client";
import { getUrl } from "service";

export type ErrorSlice = {
  manualUploadErrors: string;
};

function commonBaseTransforms(base: QueryConfig<ErrorSlice>) {
  base.url = getUrl(base.url);
  base.transform = (response: UploadResponse) => ({
    manualUploadErrors: response.errors?.join("\n") ?? "",
  });
  base.update = {
    manualUploadErrors: (_, newValue) => {
      if (newValue === "") {
        return null;
      }
      return `Upload errors:\n${newValue}`;
    },
  };
  base.force = true;
}

export const uploadIsolateFile = (req: SingleUploadRequest) => {
  const tempreq = { ...req, files: [] };
  const base = singleUpload<ErrorSlice>(tempreq);

  const formData = new FormData();
  if (req.metadata !== undefined) {
    formData.append(
      "metadata",
      new Blob([JSON.stringify(req.metadata as any)], {
        type: "application/json",
      })
    );
  }

  if (req.files) {
    [...req.files].forEach((element) => {
      formData.append("files", element as any);
    });
  }

  base.body = formData;

  commonBaseTransforms(base);
  return base;
};

export const uploadMultipleIsolates = (req: MultiUploadRequest) => {
  const tempreq = { ...req, files: [] };
  const base = multiUpload<ErrorSlice>(tempreq);

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

  commonBaseTransforms(base);
  return base;
};

export const uploadBulkMetadata = (req: BulkMetadataRequest) => {
  const tempreq = { ...req, files: [] };
  const base = bulkMetadata<ErrorSlice>(tempreq);

  const formData = new FormData();
  if (req.path) {
    formData.append(
      "path",
      new Blob([JSON.stringify(req.path as any)], {
        type: "text/plain",
      })
    );
  }
  if (req.metadataTsv !== undefined) {
    formData.append("metadata_tsv", req.metadataTsv as any);
  }

  base.body = formData;

  commonBaseTransforms(base);
  return base;
};
