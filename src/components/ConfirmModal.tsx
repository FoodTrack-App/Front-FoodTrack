"use client";
import { useEffect } from "react";

type ConfirmModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
};

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirmación",
    message,
    confirmText = "Aceptar",
    cancelText = "Cancelar",
}: ConfirmModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-xl w-[90%] max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in duration-200 pointer-events-auto">
                {/* Header */}
                <div className="px-6 py-5 bg-navy-900">
                    <h2 className="text-white font-arial text-[20px] font-bold leading-[28px]">
                        {title}
                    </h2>
                </div>

                {/* Content */}
                <div className="px-6 py-6">
                    <p className="text-gray-700 font-arial text-[16px] leading-[24px]">
                        {message}
                    </p>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 font-arial font-semibold text-[14px] hover:bg-gray-100 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-6 py-2.5 rounded-xl bg-navy-900 text-white font-arial font-semibold text-[14px] hover:bg-navy-800 transition-colors"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
