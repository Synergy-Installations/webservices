import submit from "@com.synergy/frontend-backend-dashboard/submit";
import { useGetSubmitsQuery } from "@com.synergy/frontend-backend-dashboard/submitApi";
import { div } from "framer-motion/client";
import { Link } from "@com.synergy/frontend-shared-internationalization/routing";
/* eslint-disable-next-line */
export interface SubmitListProps {}

export const SubmitList = (props: SubmitListProps) => {
  const {
    data: submits = { success: false, data: [] },
    isLoading,
    error,
  } = useGetSubmitsQuery();

  console.log("submits", submits);

  if (error) {
    return (
      <div className="flex flex-col gap-2 p-4 mt-12 items-center justify-center h-full">
        <p className="text-red-500 font-bold text-lg">
          Ein Fehler ist aufgetreten.
        </p>
        <p className="text-gray-500">
          Bitte laden Sie die Seite neu oder versuchen Sie es später erneut.
        </p>
      </div>
    );
  }

  if (isLoading)
    return (
      <div className="flex flex-col gap-4 p-4 mt-12 animate-pulse">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="border bg-synergy-light-grey border-synergy-light-grey p-4 rounded-xl"
          >
            <div className="h-6 bg-gray-300 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/3 mb-1"></div>
            <div className="h-4 bg-gray-300 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );

  return (
    <div className="flex flex-col gap-2 p-4 mt-12">
      {submits.data.map((data: any, index: number) => (
        <Link
          href={`/dashboard/submits/${data._id}`}
          key={data._id}
          className="group border border-synergy-light-grey p-2 rounded-xl hover:bg-synergy-light-grey transition-colors duration-200"
        >
          <p className="text-lg font-bold group-hover:underline">
            Projekt {index + 1}:
          </p>
          <div className="flex gap-1">
            <p className="font-medium">Adresse: </p>
            <p className="">
              {Object.values(
                (data.data ?? {}) as Record<
                  string,
                  {
                    uid: string;
                    form?: Record<
                      string,
                      {
                        uid: string;
                        selected?: { inputValue: string };
                      }
                    >;
                  }
                >
              ).find(({ uid }) => uid === "interested-products")?.form &&
                Object.values(
                  Object.values(
                    (data.data ?? {}) as Record<
                      string,
                      {
                        uid: string;
                        form?: Record<
                          string,
                          {
                            uid: string;
                            selected?: { inputValue: string };
                          }
                        >;
                      }
                    >
                  ).find(({ uid }) => uid === "interested-products")?.form ?? {}
                ).find(
                  ({ uid }: { uid: string }) =>
                    uid === "submit-form-textarea-address"
                )?.selected?.inputValue}{" "}
              {/* {
              data.data["interested-products"].form[
                "interested-products-range-2"
              ].options.unit.value
            }
            {" - "}
            {
              data.data["interested-products"].form[
                "interested-products-dachtyp"
              ].selected.selectedOptions[0]
            }
            {" - "}
            {
              data.data["interested-products"].form[
                "interested-products-schnittstelle"
              ].selected.selectedOptions[0]
            } */}
            </p>
          </div>
          {data?.status && (
            <div className="flex items-center gap-2 mt-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: data.status?.color }}
              ></div>
              <p className="text-sm font-medium">
                Status: {data?.status?.message}
              </p>
            </div>
          )}
          {/* {Object.values(submits.data[0].data[questionKey].form).map(
            (form: any) => {
              return (
                <div key={form.uid} className="mb-2">
                  <p className="text-sm">
                    <span className="font-bold">
                      {form.selected?.questionTitle}:
                    </span>
                    {form.selected?.selectedValue}
                  </p>
                </div>
              );
            }
          )} */}
        </Link>
      ))}
    </div>
  );
};

export default SubmitList;
