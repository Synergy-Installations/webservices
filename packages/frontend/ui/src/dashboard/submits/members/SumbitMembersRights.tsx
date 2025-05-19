import { Tooltip } from "flowbite-react";
import {
  useGetUserQuery,
  useSearchUsersQuery,
} from "@com.synergy/frontend-backend-dashboard/userApi";
import { useEffect, useState } from "react";
import { debounce } from "@com.synergy/frontend-ui/Debounce";
import { IsUpdateSubmitLoadingState } from "../../steps/StepsSubmit";
import { Types } from "mongoose";
import {
  useGetSubmitQuery,
  useUpdateSubmitMutation,
} from "@com.synergy/frontend-backend-dashboard/submitApi";
import Select, { StylesConfig } from "react-select";
import makeAnimated from "react-select/animated";
import { li } from "framer-motion/client";
import { MembersRights } from "@com.synergy/frontend-backend-dashboard/membersTypes";

/* eslint-disable-next-line */
export interface SumbitMembersRightsProps {
  params: { id: string; chatId?: string };
  submit: any;
  updateSubmit(props: any): any;
  isGetSubmitLoading: boolean;
  saveSubmitToggle: boolean;
  isUpdateSubmitMutationLoading: boolean;
  setSaveSubmitToggle: (saveSubmitToggle: boolean) => void;
  editSubmitToggle: boolean;
  setEditSubmitToggle: (editSubmitToggle: boolean) => void;
  isUpdateSubmitLoading: { membersRights?: boolean };
  setIsUpdateSubmitLoading: React.Dispatch<
    React.SetStateAction<{ membersRights?: boolean }>
  >;
  styles?: {
    containerClassName: string;
  };
}

const rulesOption = [
  { value: "read", label: "Lesen" },
  { value: "write", label: "Schreiben" },
  { value: "assignRights", label: "Rechte Zuteilen" },
];

const colourStyles: StylesConfig<any, true> = {
  control: (styles) => ({ ...styles, backgroundColor: "white" }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    // const color = chroma(data.color);
    return {
      ...styles,
      // backgroundColor: isDisabled
      //   ? undefined
      //   : isSelected
      //     ? data.color
      //     : isFocused
      //       ? color.alpha(0.1).css()
      //       : undefined,
      // color: isDisabled
      //   ? "#ccc"
      //   : isSelected
      //     ? chroma.contrast(color, "white") > 2
      //       ? "white"
      //       : "black"
      //     : data.color,
      // cursor: isDisabled ? "not-allowed" : "default",

      // ":active": {
      //   ...styles[":active"],
      //   backgroundColor: !isDisabled
      //     ? isSelected
      //       ? data.color
      //       : color.alpha(0.3).css()
      //     : undefined,
      // },
    };
  },
  multiValue: (styles, { data }) => {
    // const color = chroma(data.color);
    return {
      ...styles,
      // backgroundColor: color.alpha(0.1).css(),
    };
  },
  multiValueLabel: (styles, { data }) => ({
    ...styles,
    // color: data.color,
  }),
  multiValueRemove: (styles, { data }) => ({
    ...styles,
    // color: data.color,
    // ":hover": {
    //   backgroundColor: data.color,
    //   color: "white",
    // },
  }),
};

const RenderUser = ({ userUid }: { userUid: string }): JSX.Element => {
  const { data, isLoading: isUserLoading } = useGetUserQuery(userUid, {
    skip: userUid === "",
  });

  const user = data?.data[0];

  if (isUserLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-40"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <span className="text-red-500 dark:text-red-400">
        Fehler: Unbekanntes Mitglied
      </span>
    );
  }

  return (
    <span className="text-gray-900 dark:text-gray-300">
      <span className="">
        {user.firstName == null && user.lastName == null ? (
          <span className="italic">Unbekannter Name</span>
        ) : (
          `${user.firstName !== null ? `${user.firstName}` : ""}${user.lastName !== null ? ` + ${user.lastName}` : ""}`
        )}
      </span>{" "}
      <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
        {user.emailAddress}
      </span>
    </span>
  );
};

export const SumbitMembersRights = (props: SumbitMembersRightsProps) => {
  const {
    params,
    params: { id: submitId, chatId },
    submit,
    isGetSubmitLoading,
    updateSubmit,
    isUpdateSubmitMutationLoading,
    saveSubmitToggle,
    setSaveSubmitToggle,
    editSubmitToggle,
    setEditSubmitToggle,
    isUpdateSubmitLoading,
    setIsUpdateSubmitLoading,
    styles: { containerClassName } = { containerClassName: "" },
  } = props;

  const animatedComponents = makeAnimated();

  const [searchUsersInput, setSearchUsersInput] = useState<string>("");
  const { data: users, isLoading: isSearchUsersLoading } = useSearchUsersQuery(
    searchUsersInput,
    {
      skip: searchUsersInput === "",
    }
  );

  const debouncedSetSearchUsersInput = debounce((value: string) => {
    setSearchUsersInput(value);
  }, 500);

  const [editSubmit, setEditSubmit] = useState({
    _id: chatId ? new Types.ObjectId(chatId) : new Types.ObjectId(submitId),
    submitId: new Types.ObjectId(submitId),
    visibility: submit?.visibility,
    members: submit?.members,
  });

  useEffect(() => {
    console.log("editSubmitEffect", editSubmit);
    setEditSubmit({
      ...editSubmit,
      _id: new Types.ObjectId(submitId),
    });
  }, [submitId]);

  useEffect(() => {
    setEditSubmit({
      ...editSubmit,
      visibility: submit?.visibility,
      members: submit?.members,
    });
  }, [submit]);

  console.log(
    "editSubmit",
    submit,
    editSubmit,
    "loading?",
    isUpdateSubmitMutationLoading,
    isUpdateSubmitLoading
  );

  useEffect(() => {
    const handleSaveSubmitToggle = async () => {
      console.log("saveSubmitToggleBeforeIf", saveSubmitToggle);
      if (saveSubmitToggle) {
        console.log("saveSubmitToggle", editSubmit);
        // Set the loading state at the beginning in order to make sure we are handling the loading state
        // correctly in SubmitSingle in case other loading states from isUpdateSubmitLoading are false (due to no change)
        setIsUpdateSubmitLoading({
          ...isUpdateSubmitLoading,
          membersRights: true,
        });
        await updateSubmit({
          ...editSubmit,
          members: editSubmit.members?.filter(
            (member: any) => member.userUid !== ("default" as unknown)
          ),
        });
        setIsUpdateSubmitLoading({
          ...isUpdateSubmitLoading,
          membersRights: false,
        });
      } else {
        // This is done in case we do not have any changes and the SubmitSubmit useEffect
        // needs the isUpdateSubmitLoading state to be updated in order to reset the saveSubmitToggle
        // and editSubmitToggle states
        setIsUpdateSubmitLoading({
          ...isUpdateSubmitLoading,
          membersRights: false,
        });
      }
    };

    handleSaveSubmitToggle();
  }, [saveSubmitToggle]);

  // useEffect(() => {
  //   console.log(
  //     "isUpdateSubmitMutationLoadingBeforeIf",
  //     isUpdateSubmitMutationLoading,
  //     isUpdateSubmitLoading
  //   );
  //   if (isUpdateSubmitMutationLoading && !isUpdateSubmitLoading.membersRights) {
  //     console.log("isUpdateSubmitMutationLoading", isUpdateSubmitLoading);
  //     setIsUpdateSubmitLoading({
  //       ...isUpdateSubmitLoading,
  //       membersRights: true,
  //     });
  //     console.log("isUpdateSubmitMutationLoading", isUpdateSubmitLoading);
  //   } else if (
  //     !isUpdateSubmitMutationLoading &&
  //     isUpdateSubmitLoading.membersRights
  //   ) {
  //     console.log(
  //       "isUpdateSubmitMutationLoadingToFalse",
  //       isUpdateSubmitLoading
  //     );
  //     setIsUpdateSubmitLoading({
  //       ...isUpdateSubmitLoading,
  //       membersRights: false,
  //     });
  //   }
  // }, [isUpdateSubmitMutationLoading]);

  const addDefaultMember = () => {
    setEditSubmit((prev) => {
      console.log("prev", prev);
      if (
        !prev.members?.some(
          (m: MembersRights) => m.userUid.toString() === "default"
        )
      ) {
        return {
          ...prev,
          members: [
            ...(prev.members || []),
            {
              userUid: "default" as unknown,
              userAuthId: "",
              modifiedAt: new Date(),
              rights: [],
            } as MembersRights,
          ],
        };
      } else {
        return prev;
      }
    });
  };

  const debouncedAddDefaultMember = debounce(addDefaultMember, 100);

  return (
    <div className={`${containerClassName}`}>
      <div className="flex flex-col gap-1">
        <h4 className="text-lg font-semibold mb-1">Sichtbarkeitsrechte</h4>
        {isGetSubmitLoading ? (
          Array.from({ length: 1 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse flex gap-2 justify-between"
            >
              <div className="h-14 bg-gray-300 dark:bg-gray-600 rounded-lg w-full"></div>
              <div className="h-14 bg-gray-300 dark:bg-gray-600 rounded-lg w-full"></div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-between gap-2 w-full">
            <div className="flex items-center w-full ps-4 border border-gray-200 rounded-lg dark:border-gray-700">
              <input
                id="visibility-radio-public"
                type="radio"
                value="public"
                name="visibility-radio"
                checked={editSubmit.visibility === "public"}
                disabled={!editSubmitToggle}
                onChange={(e) => {
                  setEditSubmit({
                    ...editSubmit,
                    visibility: e.target.value,
                  });
                }}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="visibility-radio-public"
                className="w-full flex items-center underline decoration-dashed py-4 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300 relative group"
              >
                <Tooltip content="Diese Option macht das Projekt öffentlich. Das bedeutet, dass jeder mit dem Link das Projekt ansehen kann.">
                  <span className="">Öffentlich</span>
                </Tooltip>
              </label>
            </div>
            <div className="flex items-center w-full ps-4 border border-gray-200 rounded-lg dark:border-gray-700">
              <input
                id="visibility-radio-private"
                type="radio"
                value="private"
                name="visibility-radio"
                checked={editSubmit.visibility === "private"}
                disabled={!editSubmitToggle}
                onChange={(e) => {
                  setEditSubmit({
                    ...editSubmit,
                    visibility: e.target.value,
                  });
                }}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="visibility-radio-private"
                className="w-full flex items-center underline decoration-dashed py-4 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300 relative group"
              >
                <Tooltip content="Diese Option macht das Projekt privat. Das bedeutet, dass nur ausgewählte Mitglieder Zugriff auf das Projekt haben.">
                  <span className="">Privat</span>
                </Tooltip>
              </label>
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-col gap-2 xs:gap-1">
        <h4 className="text-lg font-semibold mb-0 xs:mb-1">Mitglieder</h4>
        {isGetSubmitLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse flex gap-2 justify-between"
            >
              <div className="h-[38px] bg-gray-300 dark:bg-gray-600 rounded-lg w-full"></div>
              <div className="h-[38px] bg-gray-300 dark:bg-gray-600 rounded-lg w-full"></div>
            </div>
          ))
        ) : editSubmit?.members == undefined ||
          editSubmit.members?.length == 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 ps-1">
            Keine Mitglieder
          </div>
        ) : (
          editSubmit.members?.map((member: any) => (
            <div
              className="flex flex-col xs:flex-row items-center justify-between gap-1 xs:gap-2 w-full"
              key={member.userUid}
            >
              <div className="w-full h-full">
                <Tooltip
                  trigger="click"
                  style="auto"
                  content={
                    <div className="relative z-[9000]">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-lg font-semibold">
                          Mitglied suchen
                        </h4>
                      </div>
                      <input
                        type="text"
                        placeholder="Namen eingeben..."
                        className="w-full text-sm mb-2 px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-700 dark:text-gray-300 focus:outline-none"
                        onChange={(e) =>
                          debouncedSetSearchUsersInput(e.target.value)
                        }
                      />
                      <ul className="max-h-40 overflow-y-auto">
                        {isSearchUsersLoading
                          ? Array.from({ length: 3 }).map((_, index) => (
                              <li key={index} className="animate-pulse">
                                <div className="py-2 flex gap-2 w-full rounded-lg justify-between">
                                  <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                                  <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                                </div>
                              </li>
                            ))
                          : users?.data.map((user) => (
                              <li key={user._id}>
                                <button
                                  className="px-3 py-2 flex gap-1 w-full rounded-lg justify-between hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                  onClick={() => {
                                    setEditSubmit({
                                      ...editSubmit,
                                      members: editSubmit.members?.map(
                                        (memberMap: any) =>
                                          memberMap.userUid === member.userUid
                                            ? {
                                                ...member,
                                                userUid: user._id,
                                                userAuthId:
                                                  user.createdUserAuthId,
                                                modifiedAt: new Date(),
                                              }
                                            : memberMap
                                      ),
                                    });
                                  }}
                                >
                                  <span className=" whitespace-nowrap">
                                    {user.firstName == null &&
                                    user.lastName == null ? (
                                      <span className="italic">
                                        Unbekannter Name
                                      </span>
                                    ) : (
                                      `${user.firstName !== null ? `${user.firstName}` : ""}${user.lastName !== null ? ` + ${user.lastName}` : ""}`
                                    )}
                                  </span>
                                  <span className="text-sm w-min text-gray-500 dark:text-gray-400 truncate">
                                    {user.emailAddress}
                                  </span>
                                </button>
                              </li>
                            ))}
                      </ul>
                    </div>
                  }
                >
                  <div className="w-full h-full border border-gray-200 rounded-lg dark:border-gray-700 relative group">
                    <button
                      disabled={!editSubmitToggle}
                      className="flex items-center w-full py-2 px-3 border-none focus:outline-none dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-300 text-left"
                    >
                      {member.userUid === "default" ? (
                        "Mitglied hinzufügen"
                      ) : (
                        <RenderUser userUid={member.userUid} />
                      )}
                    </button>
                  </div>
                </Tooltip>
              </div>
              <div className="flex items-center w-full h-full">
                <Select
                  closeMenuOnSelect={false}
                  components={animatedComponents}
                  isMulti
                  isDisabled={!editSubmitToggle}
                  value={editSubmit.members
                    ?.find(
                      (memberMap: any) => memberMap.userUid === member.userUid
                    )
                    ?.rights.map((right: any) => ({
                      value: right,
                      label: rulesOption.find(
                        (option) => option.value === right
                      )?.label,
                    }))}
                  // defaultValue={editSubmit.members
                  // ?.find((memberMap: any) => memberMap.userUid === member)
                  // ?.rights.map((right: any) => ({
                  //   value: right,
                  //   label: rulesOption.find(
                  //     (option) => option.value === right
                  //   )?.label,
                  // }))}
                  options={rulesOption}
                  className="w-full !border-gray-200 !rounded-lg h-full"
                  classNames={{
                    control: () =>
                      "!border-gray-200 !rounded-lg !h-full disabled:!bg-white",
                    menu: () => "text-sm !rounded-lg",
                    menuList: () => "!p-2",
                    option: () => "rounded-lg",
                    multiValue: () =>
                      "rounded-lg !bg-gray-100 dark:!bg-gray-600",
                  }}
                  onChange={(value) => {
                    setEditSubmit({
                      ...editSubmit,
                      members: editSubmit.members?.map((memberMap: any) =>
                        memberMap.userUid === member.userUid
                          ? {
                              ...memberMap,
                              rights: value.map((option: any) => option.value),
                              modifiedAt: new Date(),
                            }
                          : memberMap
                      ),
                    });
                  }}
                />
                {/* <input
              id="bordered-radio-2"
              type="radio"
              // value=""
              name="bordered-radio"
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="bordered-radio-2"
              className="w-full flex items-center underline decoration-dashed py-4 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300 relative group"
            >
              <Tooltip content="Diese Option macht das Projekt privat. Das bedeutet, dass nur ausgewählte Mitglieder Zugriff auf das Projekt haben.">
                <span className="">Privat</span>
              </Tooltip>
            </label> */}
              </div>
              {editSubmitToggle && (
                <div className="w-full xs:w-auto">
                  <button
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-200 hover:bg-red-600 text-black hover:text-white"
                    onClick={() => {
                      setEditSubmit({
                        ...editSubmit,
                        members: editSubmit.members?.filter(
                          (memberMap: any) =>
                            memberMap.userUid !== member.userUid
                        ),
                      });
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
        {editSubmitToggle &&
          !editSubmit.members?.some(
            (member: any) => member.userUid === "default"
          ) && (
            <button
              className="inline-flex items-center justify-center w-fit gap-1 mt-0 xs:mt-2 px-4 py-2 text-sm font-medium rounded-lg text-gray-100 hover:text-white bg-synergy-light-blue dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white"
              onClick={addDefaultMember}
            >
              Weiters Mitglied hinzufügen
            </button>
          )}
      </div>
    </div>
  );
};

export default SumbitMembersRights;
