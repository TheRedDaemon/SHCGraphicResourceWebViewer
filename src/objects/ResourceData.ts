type Empty = { type: "empty" };
type TgxData = { type: "tgx"; imageData: ImageData };

export type ResourceData = Empty | TgxData;
