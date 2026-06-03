"use client";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useParams } from "next/navigation";
import { Download, FileText, UploadCloud, X } from "lucide-react";

/* eslint-disable-next-line */
export interface FileUploadProps {
  questionKey: string;
  formKey: string;
  questionElements: any;
  setQuestionElements: any;
  STORAGE_ZONE_ACCESS_KEY: string | undefined;
}

// const STORAGE_ZONE_ACCESS_KEY = process.env.STORAGE_ZONE_ACCESS_KEY;

export const FileUpload = (props: FileUploadProps) => {
  const {
    questionKey,
    formKey,
    questionElements,
    setQuestionElements,
    STORAGE_ZONE_ACCESS_KEY,
  } = props;

  const params = useParams();
  const locale = params.locale;

  const REGION =
    questionElements[questionKey].form[formKey].options.upload.region; // If German region, set this to an empty string: ''
  const BASE_HOSTNAME =
    questionElements[questionKey].form[formKey].options.upload.hostname;
  const HOSTNAME = REGION !== "" ? `${REGION}.${BASE_HOSTNAME}` : BASE_HOSTNAME;
  const STORAGE_ZONE_NAME =
    questionElements[questionKey].form[formKey].options.upload.storageZoneName;
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
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = async () => {
        const binaryStr = reader.result;
        console.log(binaryStr);

        const fileName = `/user-upload/funnel/${questionKey}-${formKey}/synergy-upload-${Math.random().toString(36).substring(2, 7)}-${file.name}`;
        setQuestionElements((prev: any) => {
          /** Gets called twice in dev - do not fall off your chair - prod only updates the elements once */
          const updatedElements = { ...prev };
          const form = updatedElements[questionKey].form[formKey];

          form.selected.selectedFiles = [
            ...form.selected.selectedFiles,
            {
              uid: fileName,
              name: file.name,
              size: file.size,
              type: file.type,
              localUrl: URL.createObjectURL(file),
              status: "uploading",
              downloadUrl: encodeURI(
                questionElements[questionKey].form[formKey].options.download
                  .pullHostName + fileName,
              ),
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
          return updatedElements;
        });
        // console.log(questionElements);

        const response = await fetch(
          `https://${HOSTNAME}/${STORAGE_ZONE_NAME}/${fileName}`,
          {
            method: "PUT",
            headers: {
              AccessKey: STORAGE_ZONE_ACCESS_KEY || "",
              "Content-Type": "application/octet-stream",
            },
            body: binaryStr,
          },
        );

        if (response.ok) {
          setQuestionElements((prev: any) => {
            /** Gets called twice in dev - do not fall off your chair - prod only updates the elements once */
            const updatedElements = { ...prev };
            const form = updatedElements[questionKey].form[formKey];

            const fileIndex = form.selected.selectedFiles.findIndex(
              (file: any) => file.uid === fileName,
            );
            if (fileIndex !== -1) {
              form.selected.selectedFiles[fileIndex].status = "uploaded";
            }
            return updatedElements;
          });
        } else {
          setQuestionElements((prev: any) => {
            /** Gets called twice in dev - do not fall off your chair - prod only updates the elements once */
            const updatedElements = { ...prev };
            const form = updatedElements[questionKey].form[formKey];

            const fileIndex = form.selected.selectedFiles.findIndex(
              (file: any) => file.uid === fileName,
            );
            if (fileIndex !== -1) {
              form.selected.selectedFiles[fileIndex].status = "error";
            }
            return updatedElements;
          });
          console.error("File upload failed");
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleDownload = (url: string, name: string) => {
    // Use the proxy API to download the file, avoiding CORS and forcing download
    const proxyUrl = `/${locale}/api/download/file?url=${encodeURIComponent(url)}&name=${encodeURIComponent(name)}`;

    const link = document.createElement("a");
    link.href = proxyUrl;
    // We don't need 'download' attribute strictly if the server sends Content-Disposition,
    // but it doesn't hurt.
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = async () => {
    const files =
      questionElements[questionKey].form[formKey].selected.selectedFiles;
    for (const file of files) {
      const url = file.status === "uploaded" ? file.downloadUrl : file.localUrl;
      if (url) {
        // Add a small delay to ensure multiple downloads are handled correctly by the browser
        handleDownload(url, file.name);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  };

  return (
    <>
      {/* <div {...getRootProps()}>
        // <input {...getInputProps()} />
        // <p>Drag 'n' drop some files here, or click to select files</p>
        //{" "}
        // </div> */}
      <div
        {...getRootProps()}
        className="flex flex-col items-center justify-center w-full"
      >
        <label
          htmlFor={formKey}
          className="relative flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-synergy-light-blue hover:bg-synergy-light-grey dark:border-gray-600 dark:bg-gray-700 dark:hover:border-synergy-light-blue dark:hover:bg-gray-800"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadCloud
              className="mb-4 h-8 w-8 text-synergy-light-blue"
              aria-hidden="true"
              strokeWidth={1.8}
            />
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-synergy-dark-grey dark:text-synergy-light-grey">
                Click to upload
              </span>{" "}
              or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              SVG, PNG, JPG or GIF (MAX. 800x400px)
            </p>
          </div>
          <input
            {...getInputProps()}
            id={formKey}
            type="file"
            className="hidden"
          />
        </label>
      </div>
      {questionElements[questionKey].form[formKey].selected.selectedFiles
        .length > 0 && (
        <div className="flex justify-end w-full mt-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              handleDownloadAll();
            }}
            className="flex items-center gap-1 text-sm text-synergy-light-blue hover:underline focus:outline-none focus:ring-2 focus:ring-synergy-light-blue focus:ring-offset-2"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Alle herunterladen
          </button>
        </div>
      )}
      <div className="relative flex flex-col w-full mt-2">
        {questionElements[questionKey].form[formKey].selected.selectedFiles.map(
          (file: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between w-full p-2 bg-gray-100 dark:bg-gray-800 mb-2 last:mb-0 rounded"
            >
              <div className="grid sm:flex items-center sm:space-x-2">
                <div className="flex items-center space-x-2">
                  {file.type.startsWith("image/") ? (
                    <img
                      src={
                        file.status === "uploaded"
                          ? file.downloadUrl
                          : file.localUrl
                      }
                      alt=""
                      className="h-10 w-10 object-cover rounded"
                    />
                  ) : (
                    <FileText
                      className="h-10 w-10 text-synergy-dark-grey dark:text-synergy-light-grey"
                      aria-hidden="true"
                      strokeWidth={1.6}
                    />
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[150px] sm:max-w-xs">
                    {file.name}
                  </p>
                </div>
                <p
                  className={`mt-2 min-h-[1.57rem] text-sm sm:mt-0 ${file.status === "error" ? "text-red-600 dark:text-red-500" : file.status === "warning" ? "text-orange-600 dark:text-orange-500" : file.status === "uploading" ? "text-synergy-light-blue" : "text-green-600 dark:text-green-500"} `}
                >
                  {file.status === "uploading"
                    ? questionElements[questionKey].form[formKey].options.upload
                        .uploadingText
                    : file.status === "uploaded"
                      ? questionElements[questionKey].form[formKey].options
                          .upload.uploadSuccess
                      : questionElements[questionKey].form[formKey].options
                          .upload.uploadError}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDownload(file.downloadUrl, file.name);
                  }}
                  className="text-gray-500 hover:text-synergy-light-blue focus:outline-none focus:ring-2 focus:ring-synergy-light-blue focus:ring-offset-2 dark:text-gray-400 dark:hover:text-synergy-light-blue"
                  title="Download"
                >
                  <Download className="h-6 w-6" aria-hidden="true" />
                </button>
                {/** Delete Button */}
                <button
                  className="text-gray-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-synergy-light-blue focus:ring-offset-2 dark:text-gray-400 dark:hover:text-red-500"
                  title="Delete"
                  onClick={() => {
                    setQuestionElements((prev: any) => {
                      const updatedElements = { ...prev };
                      const form = updatedElements[questionKey].form[formKey];
                      form.selected.selectedFiles =
                        form.selected.selectedFiles.filter(
                          (fileFilter: any) => fileFilter.uid !== file.uid,
                        );
                      return updatedElements;
                    });
                  }}
                >
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div>
          ),
        )}
      </div>
      <p
        className={`mt-2 min-h-[1.57rem] text-sm ${questionElements[questionKey].form[formKey].message.type === "error" ? "text-red-600 dark:text-red-500" : questionElements[questionKey].form[formKey].message.type === "warning" ? "text-orange-600 dark:text-orange-500" : questionElements[questionKey].form[formKey].message.type === "loading" ? "text-synergy-light-blue" : "text-green-600 dark:text-green-500"} `}
      >
        {questionElements[questionKey].form[formKey].message.text}
      </p>
    </>
  );
};

export default FileUpload;
