"use client";

import InputCalendar from "@/components/global/InputCalendar";
import LoadingCirleIcon from "@/components/global/LoadingCirleIcon";
import LoadingPage from "@/components/global/LoadingPage";
import Pagination from "@/components/global/Pagination";
import obtenerBancos from "@/lib/moduloBanco/banco/obtenerBancos";
import anularCheque from "@/lib/moduloBanco/cheque/anularCheque";
import concicliarCheque from "@/lib/moduloBanco/cheque/conciliarCheque";
import obtenerChequesFiltros from "@/lib/moduloBanco/cheque/obtenerChequesFiltros";
import { ChequeDetails } from "@/lib/definitions";
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  MagnifyingGlassIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { type Cheque, estadoCheque, Banco } from "@prisma/client";
import Link from "next/link";
import React, { useEffect } from "react";
import { Toaster, toast } from "sonner";
import Input from "@/components/global/Input";

export default function Cheque({ params }: { params: { id: string } }) {
  const { id } = params;
  const quantityPerPage = 8;
  const filtroInit = {
    upTo: quantityPerPage,
    skip: 0,
    cuentaId: id,
    fechaDesde: "",
    fechaHasta: "",
  };

  const [actionLoading, setActionLoading] = React.useState<{[key:string]:boolean}>({});
  const [cheques, setCheques] = React.useState<ChequeDetails[]>([]);
  const [loadingContentPage, setLoadingContentPage] = React.useState(true);
  const [loadingTable, setLoadingTable] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [bancos, setBancos] = React.useState<Banco[]>([]);
  const [indicesPagina, setindicesPagina] = React.useState(0);
  const [indiceActual, setIndiceActual] = React.useState(0);

  const [filtro, setFiltro] = React.useState<{
    upTo: number;
    skip: number;
    cuentaId: string;
    fechaDesde?: string;
    fechaHasta?: string;
    bancoChequeId?: string;
    estado?: estadoCheque;
    montoDesde?: number;
    montoHasta?: number;
    esRecibido?: boolean;
  }>(filtroInit);

  const obtenerBancosHandler = async () => {
    const bancosRes = await obtenerBancos();

    if (typeof bancosRes === "string" || bancosRes === undefined) {
      setError(bancosRes || "Error al obtener los bancos para el filtro");
      setLoadingContentPage(false);
      return;
    }

    setBancos(bancosRes.data);
    setLoadingContentPage(false);
  };

  const obtenerChequesFiltroHandler = async () => {
    if (
      filtro.fechaDesde &&
      filtro.fechaHasta &&
      filtro.fechaDesde > filtro.fechaHasta
    ) {
      toast.error("La fecha desde no puede ser mayor a la fecha hasta");
      setLoadingTable(false);
      return;
    }
    setLoadingTable(true);
    const response = await obtenerChequesFiltros(filtro);

    if (typeof response === "string" || response === undefined) {
      setError(response || "Error al obtener los cheques");
      setLoadingContentPage(false);
      return;
    }

    setCheques(response.data.values);
    setindicesPagina(
      response.data.totalQuantity % quantityPerPage === 0
        ? response.data.totalQuantity / quantityPerPage
        : Math.floor(response.data.totalQuantity / quantityPerPage) + 1
    );

    setLoadingTable(false);
  };

  useEffect(() => {
    obtenerBancosHandler();
  }, []);

  useEffect(() => {
    obtenerChequesFiltroHandler();
  }, [indiceActual]);

  const handleOnChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value, type } = e.target;
    setFiltro({
      ...filtro,
      [name]: value === "" ? undefined : value,
    });
  };

  const onKeyDownHandleForNumberInputs = (e: React.KeyboardEvent) => {
    if (e.key === "e" || e.key === "-") {
      e.preventDefault();
    }
  };

  const changeIndicePagina = async (indice: number) => {
    setIndiceActual(indice);
    setFiltro({
      ...filtro,
      skip: indice * quantityPerPage,
    });
  };

  const handleConciliar = async (id: string, bancoAfectadoId: string) => {

    setActionLoading((prevState) => ({ ...prevState, [id]: true }));
    const response = await concicliarCheque(id, bancoAfectadoId);

    if (typeof response === "string" || response === undefined) {
      setError(response || "Error al conciliar el cheque");
      setLoadingContentPage(false);
      return;
    }

    const prevCheques = [...cheques];
    setActionLoading((prevState) => ({ ...prevState, [id]: false }));

    setCheques(
      prevCheques.map((cheque) =>
        cheque.id === id ? { ...cheque, estado: estadoCheque.PAGADO } : cheque
      )
    );
  };

  const handleAnular = async (id: string, bancoAfectadoId: string) => {
    setActionLoading((prevState) => ({ ...prevState, [id]: true }));
    const response = await anularCheque(id, bancoAfectadoId);

    if (typeof response === "string" || response === undefined) {
      setError(response || "Error al anular el cheque");
      setLoadingContentPage(false);
      return;
    }

    const prevCheques = [...cheques];
    setActionLoading((prevState) => ({ ...prevState, [id]: false }));
    setCheques(
      prevCheques.map((cheque) =>
        cheque.id === id ? { ...cheque, estado: estadoCheque.ANULADO } : cheque
      )
    );
  };

  if (loadingContentPage) return <LoadingPage />;

  if (error) return <h1 className="text-red-500">{error}</h1>;

  return (
    <div className="flex flex-col h-full -mt-8">
      <header className="flex flex-col gap-4 justify-between items-center flex-wrap px-8 py-4 w-full rounded-md bg-primary-800 text-white">
        <div className="flex justify-between items-center w-full">
          <h1 className="text-2xl font-bold">Cheques</h1>
          <Link
            className="bg-gray-800 hover:bg-gray-900 text-white  py-2 px-4 rounded"
            href={`/dashboard/account/${id}`}
          >
            Atras
          </Link>
        </div>

        <nav className="flex flex-wrap md:items-center md:flex-row flex-col gap-4 w-full">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <h3 className="mr-2">Bancos</h3>
              <select
                className="bg-gray-800 text-white py-1 px-2 rounded-md "
                name="bancoChequeId"
                onChange={handleOnChange}
                value={filtro.bancoChequeId || ""}
              >
                <option value={""}>Todos</option>
                {bancos.map((banco, index) => (
                  <option key={index} value={banco.id}>
                    {banco.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <h3 className="mr-2">Estado</h3>
              <select
                className="bg-gray-800 text-white py-1 px-2 rounded-md w-full"
                name="estado"
                onChange={handleOnChange}
                value={filtro.estado !== undefined? filtro.estado.toString() : ""}
              >
                <option value={""}>Todos</option>
                {Object.values(estadoCheque).map((estadoCheque, index) => (
                  <option key={index} value={estadoCheque}>
                    {estadoCheque}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="flex flex-col items-center justify-between gap-2">
              <h3 className="mr-2">Operacion</h3>
              <select
                className="bg-gray-800 text-white py-1 px-2 rounded"
                name="esRecibido"
                onChange={handleOnChange}
                value={filtro.esRecibido !== undefined? filtro.esRecibido.toString() : ""}
              >
                <option value={""}>Todos</option>
                <option value={"true"}>Recibido</option>
                <option value={"false"}>Emitido</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <h3 className="">Desde</h3>
              <InputCalendar
                handleChange={handleOnChange}
                value={filtro.fechaDesde || ""}
                className="bg-gray-800 text-white py-1 px-2 rounded"
                id="fechaDesde"
              />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="">Hasta</h3>
              <InputCalendar
                handleChange={handleOnChange}
                value={filtro.fechaHasta || ""}
                className="bg-gray-800 text-white py-1 px-2 rounded"
                id="fechaHasta"
              />
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Input
              onChange={(e) => {
                setFiltro({ ...filtro, montoDesde: Number(e.target.value) });
              }}
              className="bg-gray-800 text-white py-1 px-2 rounded"
              value={filtro.montoDesde || ""}
              placeholder="Monto Desde"
              type="formattedNumber"
              id="montoDesde"
            />
            <Input
              onChange={(e) => {
                setFiltro({ ...filtro, montoHasta: Number(e.target.value) });
              }}
              className="bg-gray-800 text-white py-1 px-2 rounded"
              value={filtro.montoHasta || ""}
              placeholder="Monto Hasta"
              type="formattedNumber"
              id="montoHasta"
            />
          </div>

          <div className="flex flex-col items-center gap-3">
            <button
              onClick={async () => {
                await obtenerChequesFiltroHandler();
              }}
              className="bg-primary-500 hover:bg-primary-600 text-white p-1 rounded"
            >
              <MagnifyingGlassIcon className="w-6 h-6" />
            </button>
            <button
              onClick={async () => {
                setFiltro(filtroInit);
              }}
              className="bg-primary-500 hover:bg-primary-600 text-white p-1 rounded"
            >
              <TrashIcon className="w-6 h-6" />
            </button>
          </div>
        </nav>
      </header>

      <h2 className="text-xl font-bold my-4">Lista de Cheques</h2>

      <div className="flex-grow bg-gray-800 rounded-md p-5 flex flex-col">
        {loadingTable ? (
          <div className="flex items-center justify-center h-32">
            <LoadingCirleIcon className="w-12 h-12 mx-auto animate-spin" />
          </div>
        ) : cheques.length === 0 ? (
          <h2>No hay cheques para mostrar</h2>
        ) : (
          <>
            <table className="border-collapse w-full">
              <thead>
                <tr>
                  <th>
                    <span className="text-md mt-1 text-primary-400 font-normal">
                      Operacion
                    </span>
                  </th>
                  <th className="text-left">
                    <span className="text-md mt-1 text-primary-400 font-normal">
                      N° Cheque
                    </span>
                  </th>
                  <th className="text-left">
                    <span className="text-md mt-1 text-primary-400 font-normal">
                      Tipo
                    </span>
                  </th>
                  <th className="text-left">
                    <span className="text-md mt-1 text-primary-400 font-normal">
                      Fecha Emision
                    </span>
                  </th>
                  <th className="text-left">
                    <span className="text-md mt-1 text-primary-400 font-normal">
                      Cheque Banco
                    </span>
                  </th>
                  <th>
                    <span className="text-md mt-1 text-primary-400 font-normal">
                      Estado
                    </span>
                  </th>
                  <th className="text-left">
                    <span className="text-md mt-1 text-primary-400 font-normal">
                      Monto
                    </span>
                  </th>
                  <th>
                    <span className="text-md mt-1 text-primary-400 font-normal">
                      Accion
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {cheques.map((cheque) => (
                  <tr
                    className="border-b-2 border-b-gray-700 text-sm"
                    key={cheque.id}
                  >
                    <td className="py-2 flex justify-center">
                      <div className="w-6 h-6">
                        {!cheque.esRecibido ? (
                          <ArrowUpRightIcon className="text-red-500" />
                        ) : (
                          <ArrowDownLeftIcon className="text-green-500" />
                        )}
                      </div>
                    </td>
                    <td>{cheque.numeroCheque}</td>
                    <td>{cheque.fechaPago? "Diferido" : "Común"}</td>
                    <td>{cheque.fechaEmision.toString().split("T")[0]}</td>
                    <td>{cheque.bancoCheque.nombre}</td>
                    <td className="flex justify-center">
                      {
                      cheque.estado === estadoCheque.PAGADO ? (
                        <span className="bg-green-500 p-1 rounded my-2">
                          {estadoCheque.PAGADO}
                        </span>
                      ) : cheque.estado === estadoCheque.EMITIDO ? (
                        <span className="bg-yellow-500 p-1 rounded my-2">
                          {estadoCheque.EMITIDO}
                        </span>
                      ) : (
                        <span className="bg-red-500 p-1 rounded my-2">
                          {estadoCheque.ANULADO}
                        </span>
                      )}
                    </td>
                    <td>{Number(cheque.monto).toLocaleString()}</td>
                    <td className="flex justify-center">
                      { 
                        actionLoading[cheque.id] ? 
                        <span className="flex items-center gap-2 bg-gray-600 p-1 rounded my-2">
                          Cargando
                          <LoadingCirleIcon className="w-6 h-6 mx-auto animate-spin" />
                        </span>
                        :
                        (
                          <div className="flex gap-2">

                          { 
                            !cheque.esRecibido &&
                            cheque.estado === estadoCheque.EMITIDO &&
                            <button
                              onClick={async () =>
                                await handleConciliar(
                                  cheque.id,
                                  cheque.cuentaAfectada.bancoId
                                )
                              }
                              className="disabled:opacity-50 disabled:cursor-not-allowed border-gray-700 border-2 hover:bg-green-900 p-1 rounded"
                            >
                              Conciliar
                            </button>
                          }
                          
                          {
                            cheque.esRecibido 
                            && cheque.estado === estadoCheque.PAGADO
                            && cheque.bancoChequeId !== cheque.cuentaAfectada.bancoId
                            && (
                              <button
                                onClick={async () =>
                                  await handleAnular(
                                    cheque.id,
                                    cheque.cuentaAfectada.bancoId
                                  )
                                }
                                className="border-gray-700 border-2 hover:bg-red-900 p-1 rounded"
                              >
                                Anular
                              </button>
                            )
                          }
                          
                        </div>)
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-2 w-full">
              <Pagination
                changeIndicePagina={changeIndicePagina}
                indiceActual={indiceActual}
                indicesPagina={indicesPagina}
              />
            </div>
          </>
        )}
      </div>
      <Toaster richColors />
    </div>
  );
}
