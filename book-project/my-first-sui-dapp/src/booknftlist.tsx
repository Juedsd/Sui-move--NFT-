export interface BookNFTList {
    id: {
        id: string;
    };
    nid: string;
    title: string;
    description: string;
    content: string;
    author: string;
    owner: string;
    ask: number,
    baglist: any,
    taker_list: any,
}

export interface MyCard {
    id: {
        id: string;
    };
    title: string;
    description: string;
    content: string;
    author: string;
    url: string;
}