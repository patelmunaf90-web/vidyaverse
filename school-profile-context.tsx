import { createContext, useContext, useState, ReactNode } from "react";

type SchoolProfileType = {
  profile: any;
  setProfile: (val: any) => void;
};

const SchoolProfileContext = createContext<SchoolProfileType | undefined>(undefined);

export const SchoolProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState(null);

  return (
    <SchoolProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </SchoolProfileContext.Provider>
  );
};

export const useSchoolProfile = () => {
  const context = useContext(SchoolProfileContext);
  if (!context) {
    throw new Error("useSchoolProfile must be used within SchoolProfileProvider");
  }
  return context;
};
