"use client";
import Input from "@/components/global/Input";
import cerrarCajaAdmin from "@/lib/aperturaCaja/cerrarCajaAdmin";
import { login } from "@/lib/auth/login";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PasswordField from "../auth/PasswordField";
import { AperturaCaja, Caja } from "@prisma/client";
import { obtenerCookie } from "@/lib/obtenerCookie";
import { Cajero } from "@/lib/definitions";

type Params = {
    exito: boolean,
    monto: number
};

export default function FormArqueo({exito, monto}: Params) {
    const router = useRouter();
    const caja: Caja = obtenerCookie("caja");
    const apertura: AperturaCaja = obtenerCookie("apertura");
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const target = e.target as typeof e.target & {
            username: { value: string };
            password: { value: string };
        };
        const username = target.username.value;
        const password = target.password.value;
        const error = await login({ username, password });
        if (!error) {
            const res = await cerrarCajaAdmin(caja.id, apertura.id);
            router.push("/dashboard/caja");
        } else {
            throw new Error(error);
        }
    };

    return (
        exito? 
            <div className="mt-20">
                <h1 className="text-white text-center text-2xl">El Cierre de Caja Fue Exitoso</h1><br />
                <p className="text-white text-left"></p>
                <p className="text-white text-left"></p>
                <p className="text-white text-left">Monto de cierre: {monto} Gs.</p>
            </div> 
        :


        <form className="flex flex-col w-full gap-4" onSubmit={handleSubmit}>
            <h1 className="text-center text-2xl">Hubo un error durante el cierre de caja</h1>
            <p className="text-sm text-center">Para continuar con el cierre ingrese la contraseña de autorizacion del gerente</p>
            <div className="flex justify-between items-center gap-4 mt-10">
                <div className="flex flex-col gap-2">
                    <label htmlFor="monto">Usuario</label>
                    <input
                        className="w-full bg-gray-700 rounded-lg py-[9px] pl-10"
                        id="username"
                        type="text"
                        name="username"
                        placeholder="Ingrese su nombre"
                        autoComplete="name"
                        required    
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <PasswordField
                        label="Contraseña"
                        name="password"
                        placeholder="Contraseña"
                        validate={false}
                    />
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <label htmlFor="observacion">Observación</label>
                <textarea
                id="observacion"
                name="observacion"
                placeholder="Observación"
                className="block w-full bg-gray-800 rounded py-3 px-6 my-2 leading-tight focus:outline-none [max-h-40] resize-none"
                />
            </div>
            <button
                type="submit"
                className="bg-primary-800 p-2 rounded-md text-white hover:bg-primary-700 transition-all duration-300 ease-in-out"
            >
                Finalizar Cierre
            </button>
        </form>
    );
}