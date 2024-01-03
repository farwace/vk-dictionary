export type TWord = {
    id?: number;
    word: string;
    foreignWord: string;
    collectionId: number;
    fileId?: number;
    transcription?:string;
};
export type TWords = TWord[];