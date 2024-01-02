export type TWord = {
    id?: number;
    word: string;
    foreignWord: string;
    collectionId: number;
    fileId?: number;
};
export type TWords = TWord[];