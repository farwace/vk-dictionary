import type LocalJson from "./ru.json";

type FlattenKeys<T, Prefix extends string = ''> = T extends object
    ? {
        [K in keyof T]-?: T[K] extends string
            ? `${Prefix & string}${Prefix extends '' ? '' : '.'}${K & string}`
            : FlattenKeys<T[K], `${Prefix & string}${Prefix extends '' ? '' : '.'}${K & string}`>;
    }[keyof T]
    : '';

//export type TranslateFunction = (l: DeepLeafKeys<typeof LocalJson>, args?: Record<string, string | number>) => string
export type TranslateFunction = (l: FlattenKeys<typeof LocalJson>, args?: Record<string, string | number>) => string
