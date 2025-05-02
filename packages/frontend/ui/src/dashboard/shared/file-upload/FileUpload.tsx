"use client";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { AssetInterface } from "@com.synergy/frontend-backend-dashboard/step";

export interface FileUploadProps {
  // Use empty string for Frankfurt, DE region
  STORAGE_ZONE_REGION: string | undefined;
  STORAGE_ZONE_BASE_HOSTNAME: string | undefined;
  STORAGE_ZONE_NAME: string | undefined;
  STORAGE_ZONE_ACCESS_KEY: string | undefined;
  submitId: string;
  stepId?: string;
  assets: AssetInterface[] | undefined;
  setAssets(
    asset: AssetInterface | ((prev: { assets: AssetInterface }) => any)
  ): void;
}

export const FileUpload = (props: FileUploadProps) => {
  const {
    STORAGE_ZONE_ACCESS_KEY,
    STORAGE_ZONE_REGION,
    STORAGE_ZONE_BASE_HOSTNAME,
    STORAGE_ZONE_NAME,
    submitId,
    stepId,
    assets,
    setAssets,
  } = props;

  const HOSTNAME =
    STORAGE_ZONE_REGION !== "de"
      ? `${STORAGE_ZONE_REGION}.${STORAGE_ZONE_BASE_HOSTNAME}`
      : STORAGE_ZONE_BASE_HOSTNAME;
  console.log("STORAGE_ZONE_REGION", STORAGE_ZONE_REGION);

  // const STORAGE_ZONE_NAME =
  //   questionElements[questionKey].form[formKey].options.upload.storageZoneName;
  // const FILENAME_TO_UPLOAD = "filenameyouwishtouse.txt";
  // const FILE_PATH = "/path/to/your/file/upload.txt";
  // const ACCESS_KEY = "YOUR_BUNNY_STORAGE_API_KEY";

  // const uploadFile = async () => {
  //   const readStream = fs.createReadStream(FILE_PATH);

  //   const options = {
  //     method: "PUT",
  //     host: HOSTNAME,
  //     path: `/${STORAGE_ZONE_NAME}/${FILENAME_TO_UPLOAD}`,
  //     headers: {
  //       AccessKey: ACCESS_KEY,
  //       "Content-Type": "application/octet-stream",
  //     },
  //   };

  //   const req = https.request(options, (res) => {
  //     res.on("data", (chunk) => {
  //       console.log(chunk.toString("utf8"));
  //     });
  //   });

  //   req.on("error", (error) => {
  //     console.error(error);
  //   });

  //   readStream.pipe(req);
  // };

  // const main = async () => {
  //   await uploadFile();
  // };

  // main();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log("acceptedFiles", acceptedFiles);
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = async () => {
        const binaryStr = reader.result;
        console.log(binaryStr);

        const fileName = `/user-upload/dashboard/${submitId}${stepId && `-${stepId}`}/synergy-upload-${Math.random().toString(36).substring(2, 7)}-${file.name}`;

        setAssets((prev) => {
          /** Gets called twice in dev - do not fall off your chair - prod only updates the elements once */
          const updatedAssets = {
            assets: [...((prev as any).assets as AssetInterface[])],
          };

          updatedAssets.assets = [
            ...updatedAssets.assets,
            {
              name: file.name,
              size: file.size,
              type: file.type,
              status: "uploading",
              filePath: encodeURI(fileName),
              createdAt: new Date(),
            },
          ];
          /** Used for when mulptiple = false */
          //  else if (
          //   questionElements[questionKey].form[formKey].type === "radio"
          // ) {
          //   /** Radio - only one option can be selected */
          //   form.selected.selectedOptions = [
          //     questionElements[questionKey].form[formKey].options[optionKey]
          //       .title,
          //   ];
          //   form.selected.selectedOptionsUid = [optionKey];
          // }
          /** Used when removing files */
          // else {
          //   /** Remove selectedOptions which only works for checkbox (radio cannot detect deselection) */
          //   form.selected.selectedOptions =
          //     form.selected.selectedOptions.filter(
          //       (option: string) =>
          //         option !==
          //         questionElements[questionKey].form[formKey].options[optionKey]
          //           .title
          //     );
          //   form.selected.selectedOptionsUid =
          //     form.selected.selectedOptionsUid.filter(
          //       (option: string) => option !== optionKey
          //     );
          //   // if (
          //   //   form.selected[selectedOptionIndex]
          //   //     .selectedOptions.length === 0
          //   // ) {
          //   //   form.selected.splice(
          //   //     selectedOptionIndex,
          //   //     1
          //   //   );
          //   // }
          // }
          return updatedAssets;
        });

        const response = await fetch(
          `https://${HOSTNAME}/${STORAGE_ZONE_NAME}${fileName}`,
          {
            method: "PUT",
            headers: {
              AccessKey: STORAGE_ZONE_ACCESS_KEY || "",
              "Content-Type": "application/octet-stream",
            },
            body: binaryStr,
          }
        );

        if (response.ok) {
          setAssets((prev: any) => {
            /** Gets called twice in dev - do not fall off your chair - prod only updates the elements once */
            const updatedAssets = {
              assets: [...((prev as any).assets as AssetInterface[])],
            };

            const fileIndex = updatedAssets.assets.findIndex(
              (file) => file.filePath === fileName
            );
            if (fileIndex !== -1) {
              updatedAssets.assets[fileIndex].status = "uploaded";
            }
            return updatedAssets;
          });
        } else {
          setAssets((prev: any) => {
            /** Gets called twice in dev - do not fall off your chair - prod only updates the elements once */
            const updatedAssets = {
              assets: [...((prev as any).assets as AssetInterface[])],
            };

            const fileIndex = updatedAssets.assets.findIndex(
              (file) => file.filePath === fileName
            );
            if (fileIndex !== -1) {
              updatedAssets.assets[fileIndex].status = "error";
            }
            return updatedAssets;
          });
          console.error("File upload failed");
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="px-2">
      {/* <div {...getRootProps()}>
        // <input {...getInputProps()} />
        // <p>Drag 'n' drop some files here, or click to select files</p>
        //{" "}
      </div> */}
      <div
        {...getRootProps()}
        className="flex flex-col items-center justify-center w-full"
      >
        <input
          {...getInputProps()}
          id={stepId}
          type="file"
          className="hidden"
        />
        <label
          // htmlFor={stepId}
          className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              SVG, PNG, JPG or GIF (MAX. 800x400px)
            </p>
          </div>
        </label>
      </div>
      <div className="relative flex flex-col w-full">
        {assets?.map((file: any, index: number) => (
          <div
            key={index}
            className="flex items-center justify-between w-full p-2 bg-gray-100 dark:bg-gray-800"
          >
            <div className="grid sm:flex items-center sm:space-x-2">
              <div className="flex items-center space-x-2">
                {file.type.startsWith("image/") ? (
                  <img
                    src={
                      file.status === "uploaded"
                        ? `https://${STORAGE_ZONE_NAME}.b-cdn.net${file.filePath}`
                        : file.localUrl
                    }
                    alt=""
                    className="w-10 h-10 object-cover"
                  />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-10"
                    id="file"
                  >
                    <path
                      fill="#000000"
                      d="M20,8.94a1.31,1.31,0,0,0-.06-.27l0-.09a1.07,1.07,0,0,0-.19-.28h0l-6-6h0a1.07,1.07,0,0,0-.28-.19l-.09,0L13.06,2H7A3,3,0,0,0,4,5V19a3,3,0,0,0,3,3H17a3,3,0,0,0,3-3V9S20,9,20,8.94ZM14,5.41,16.59,8H14ZM18,19a1,1,0,0,1-1,1H7a1,1,0,0,1-1-1V5A1,1,0,0,1,7,4h5V9a1,1,0,0,0,1,1h5Z"
                    ></path>
                  </svg>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {file.name}
                </p>
              </div>
              <p
                className={`text-sm mt-2 min-h-[1.57rem] ${file.status === "error" ? "text-red-600 dark:text-red-500" : file.status === "warning" ? "text-orange-600 dark:text-orange-500" : "text-green-600 dark:text-green-500"} `}
              >
                {file.status === "uploading"
                  ? "Uploading..."
                  : file.status === "uploaded"
                    ? "Uploaded"
                    : file.status === "error" && "Error"}
              </p>
            </div>
            <button
              className=""
              onClick={() => {
                setAssets((prev: any) => {
                  /** Gets called twice in dev - do not fall off your chair - prod only updates the elements once */
                  const updatedAssets = {
                    assets: [...((prev as any).assets as AssetInterface[])],
                  };
                  updatedAssets.assets = updatedAssets.assets.filter(
                    (fileFilter) => fileFilter.filePath !== file.filePath
                  );
                  return updatedAssets;
                });
              }}
            >
              <svg
                className="w-6 h-6 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
      {/* <p
        className={`text-sm mt-2 min-h-[1.57rem] ${questionElements[questionKey].form[formKey].message.type === "error" ? "text-red-600 dark:text-red-500" : questionElements[questionKey].form[formKey].message.type === "warning" ? "text-orange-600 dark:text-orange-500" : questionElements[questionKey].form[formKey].message.type === "loading" ? "text-blue-600 dark:text-blue-500" : "text-green-600 dark:text-green-500"} `}
      >
        {questionElements[questionKey].form[formKey].message.text}
      </p> */}
    </div>
  );
};

export default FileUpload;
