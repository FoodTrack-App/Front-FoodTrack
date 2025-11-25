"use client";
import CardContent from "@/components/admin/Cards";
import Avatar from "@/components/ui/Avatar";

type Props = {
  user: {
    nombreContacto?: string;
    usuario?: string;
    rol?: string;
    fotoPerfil?: string;
  } | null;
};

export default function ProfileCard({ user }: Props) {
  if (!user) return null;

  return (
    <CardContent noPadding variant={"1"}>
      <div className="w-full bg-gradient-to-b p-10 from-Blue-700 from-50% to-transparent to-50% rounded-2xl items-center justify-center flex">
        <Avatar 
          name={user.nombreContacto || user.usuario || "Usuario"} 
          size="xl"
        />
      </div>
      <div className="flex flex-col items-center gap-3 pb-6 ">
        <h1 className="text-gray-900 font-sans text-2xl not-italic font-normal leading-9 text-center">
          {user.nombreContacto || user.usuario}
        </h1>
        <p className="text-gray-900 text-center font-sans text-base not-italic font-normal leading-6 bg-Blue-50 w-fit rounded-2xl px-5 py-2">
          {user.rol}
        </p>
      </div>
    </CardContent>
  );
}
