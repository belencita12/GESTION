"use client";
import React, { useState, useEffect, useCallback } from "react";
import Header from "@/components/dashboard/account/Header";
import BankAccount from "@/components/dashboard/account/BankAccount";
import obtenerCuentaBancaria from "@/lib/cuentaBancaria/obtenerCuentaBancaria";
import { CuentaBancaria } from "@prisma/client";

export default function Page() {
  const [cuentasOriginales, setCuentasOriginales] = useState<CuentaBancaria[]>(
    []
  );
  const [cuentasFiltradas, setCuentasFiltradas] = useState<CuentaBancaria[]>(
    []
  );
  const [bancoSeleccionado, setBancoSeleccionado] = useState<string | null>(
    null
  );
  const [tipoCuentaSeleccionado, setTipoCuentaSeleccionado] = useState<
    string | null
  >(null);
  const [verSaldo, setVerSaldo] = useState<boolean>(false);

  const obtenerCuentas = useCallback(async () => {
    try {
      const cuentasData = await obtenerCuentaBancaria();
      if (
        cuentasData != undefined &&
        typeof cuentasData !== "string" &&
        cuentasData.data != undefined &&
        typeof cuentasData.data !== "string"
      ) {
        setCuentasOriginales(cuentasData.data);
      }
    } catch (error) {
      console.error("Error al obtener las cuentas:", error);
    }
  }, []);

  useEffect(() => {
    obtenerCuentas();
  }, [obtenerCuentas]);

  useEffect(() => {
    // Filtrar cuentas originales según los filtros seleccionados
    let cuentasFiltradasTemp = [...cuentasOriginales];

    if (bancoSeleccionado && bancoSeleccionado !== "Todos") {
      cuentasFiltradasTemp = cuentasFiltradasTemp.filter(
        (cuenta) => cuenta.bancoId === bancoSeleccionado
      );
    }

    if (tipoCuentaSeleccionado && tipoCuentaSeleccionado !== "Todos") {
      cuentasFiltradasTemp = cuentasFiltradasTemp.filter(
        (cuenta) =>
          cuenta.esCuentaAhorro ===
          (tipoCuentaSeleccionado === "Cuenta de ahorro")
      );
    }

    // Establecer las cuentas filtradas en el estado
    setCuentasFiltradas(cuentasFiltradasTemp);
  }, [bancoSeleccionado, tipoCuentaSeleccionado, cuentasOriginales]);

  return (
    <div className="flex flex-col h-full -mt-8">
      <Header
        onBancoSeleccionado={setBancoSeleccionado}
        onTipoCuentaSeleccionado={setTipoCuentaSeleccionado}
        onVerSaldo={setVerSaldo}
      />
      <div className="bg-gray-700 container mx-auto mt-2 rounded-md">
        <h1 className="text-4xl font-bold text-center pt-3 text-white">
          Cuentas
        </h1>
        <div className="flex items-center justify-center py-6 flex-wrap gap-4 md:gap-8">
          {cuentasFiltradas.map((cuenta: CuentaBancaria) => (
            <BankAccount
              key={cuenta.id}
              id={cuenta.id}
              numeroCuenta={cuenta.numeroCuenta}
              esCuentaAhorro={cuenta.esCuentaAhorro}
              bancoId={cuenta.bancoId}
              saldo={Number(cuenta.saldo)}
              saldoDisponible={Number(cuenta.saldoDisponible)}
              verSaldo={verSaldo}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
