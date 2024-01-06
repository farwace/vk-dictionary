export type TWord = {
    id?: number;
    word: string;
    foreignWord: string;
    collectionId: number;
    fileId?: number;
    transcription?:string;
};
export type TWords = TWord[];

export type TRawWord = {
    id?: number;
    word: string;
    foreign_word: string;
    collection_id: number;
    file_id?: number;
    transcription?:string;
}