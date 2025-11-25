import { Bill } from "@solar-icons/react";
import { PhoneOutline, UserOutline } from "solar-icon-set";

type Props = {
    userName: string;
    contactName?: string;
    userRol: 'Mesero' | 'Cajero';
    userPhone: number;
    onClick?: () => void;
};

export default function UserCard({ userName, contactName, userRol, userPhone, onClick }: Props) {
    const displayName = contactName || userName;
    const initials = displayName
        .split(' ')
        .map(word => word[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-2xl p-6 border-1 border-Gray-300 gap-2 flex flex-col hover:shadow-md transition-shadow cursor-pointer">
            <div className="bg-Blue-700 rounded-full w-15 h-15 items-center justify-center flex">
                <p className="text-white font-sans text-xl not-italic font-normal leading-7 uppercase">
                    {initials}
                </p>
            </div>
            <p className="text-navy-900 font-sans text-base not-italic font-normal leading-6">
                {displayName}
            </p>
            <div className="text-gray-600 font-sans text-sm not-italic font-normal leading-5 flex flex-row gap-1.5 items-center">
                <UserOutline className="h-4 w-4" />
                {userName}
            </div>
            <div className="flex flex-row gap-2 items-center">
                {userRol === 'Mesero' && <img src="/spoon-and-fork.svg" className="h-4.5 w-4.5" />}
                {userRol === 'Cajero' && <Bill weight="Outline" className="h-4.5 w-4.5" />}
                <p className="text-gray-700 font-sans text-sm not-italic font-normal leading-5">
                    {userRol}
                </p>
            </div>
            <div className="text-gray-500 font-sans text-sm not-italic font-normal leading-5 flex flex-row gap-2 items-center">
                <PhoneOutline />
                {userPhone}
            </div>
        </div>
    );
}
