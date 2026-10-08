"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export function useAuthRedirect() {
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const checkAuthentication = async () => {
            const token = localStorage.getItem("token");

            // No token → user is not logged in.
            if (!token) {
                if (isMounted) {
                    setCheckingAuth(false);
                }

                return;
            }

            try {
                // Validate the JWT with the backend.
                const user = await api<{
                    id: number;
                    email: string;
                    role: string;
                }>("/api/auth/me");

                // Keep the browser data synchronized
                // with the authenticated backend user.
                localStorage.setItem("email", user.email);
                localStorage.setItem("role", user.role);

                // Valid JWT → user is already logged in.
                window.location.replace("/dashboard");
            } catch (error) {
    console.error("AUTH CHECK FAILED:", error);

    if (isMounted) {
        setCheckingAuth(false);
    }
}
        };

        checkAuthentication();

        // Handles browser Back / Forward cache.
        const handlePageShow = () => {
            checkAuthentication();
        };

        window.addEventListener("pageshow", handlePageShow);

        return () => {
            isMounted = false;
            window.removeEventListener("pageshow", handlePageShow);
        };
    }, []);

    return checkingAuth;
}