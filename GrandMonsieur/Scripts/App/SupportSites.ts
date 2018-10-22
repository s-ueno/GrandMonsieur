namespace GrandMonsieur {

    export enum SupportSites {
        Youtube = 1 << 0,
        Dailymotion = 1 << 1,
        NicoNico = 1 << 2,
        Bilibili = 1 << 3,


        All = Youtube | Dailymotion | NicoNico | Bilibili
    }

}