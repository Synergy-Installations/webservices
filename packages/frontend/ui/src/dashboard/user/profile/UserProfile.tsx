import { UserProfile as UserProfileClerk } from "@clerk/nextjs";

/* eslint-disable-next-line */
export interface UserProfileProps {}

export const UserProfile = (props: UserProfileProps) => {
  return (
    <div className="pt-12 h-screen flex items-center justify-center">
      <UserProfileClerk 
      path="/de-AT/dashboard/user/profile" 
      fallback={
        <div className="animate-pulse flex flex-col items-center space-y-4">
        <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
        <div className="w-48 h-6 bg-gray-300 rounded"></div>
        <div className="w-32 h-6 bg-gray-300 rounded"></div>
        </div>
      } 
      />
    </div>
  );
};

export default UserProfile;
