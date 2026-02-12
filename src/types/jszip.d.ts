declare module "jszip" {
    interface JSZipObject {
        name: string;
        dir: boolean;
        async(type: "string"): Promise<string>;
        async(type: "nodebuffer"): Promise<Buffer>;
        async(type: "uint8array"): Promise<Uint8Array>;
        async(type: "arraybuffer"): Promise<ArrayBuffer>;
        async(type: "blob"): Promise<Blob>;
    }

    interface JSZipFiles {
        [key: string]: JSZipObject;
    }

    interface JSZip {
        files: JSZipFiles;
        file(name: string): JSZipObject | null;
        file(regex: RegExp): JSZipObject[];
    }

    interface JSZipStatic {
        loadAsync(data: Buffer | ArrayBuffer | Uint8Array | string): Promise<JSZip>;
    }

    const JSZip: JSZipStatic;
    export default JSZip;
}
