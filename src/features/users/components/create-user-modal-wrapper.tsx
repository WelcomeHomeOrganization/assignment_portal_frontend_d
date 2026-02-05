"use client";

import { useRouter } from "next/navigation";
import { CreateUserModal } from "./create-user-modal";

export function CreateUserModalWrapper() {
    const router = useRouter();

    const handleSuccess = () => {
        router.refresh();
    };

    return <CreateUserModal onSuccess={handleSuccess} />;
}
