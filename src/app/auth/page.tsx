import AuthForms from "@/components/sections/Auth/Forms";
import { siteConfig } from "@/config/site";
import { Metadata, NextPage } from "next";

export const metadata: Metadata = {
  title: `Welcome Back to ${siteConfig.name}`,
};

const AuthPage: NextPage = () => {
  return <AuthForms />;
};

export default AuthPage;
