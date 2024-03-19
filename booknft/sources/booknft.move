module booknft::marketplace {
    use sui::dynamic_object_field as ofield;
    use sui::tx_context::{Self, TxContext};
    use sui::object::{Self, ID, UID};
    use sui::coin::{Self, Coin};
    use sui::transfer;
    
    use sui::url::{Self, Url};
    use std::string;
    use sui::event;


    //0x2::sui::SUI
    //0xe5ff61371d7c5461f165477bb985741e01bc7bb01d867e439f0df6c4f6eaf0b5::book_nft::BookNFT

    const EAmountIncorrect: u64 = 0;

    const ENotOwner: u64 = 1;

    struct BookNFT has key, store {
        id: UID,
        title: string::String,
        author: address,
        description:  string::String,
        content: string::String,
        url: Url,

    }

    struct Marketplace<phantom COIN> has key {
        id: UID,
    }

    struct Listing has key, store {
        id: UID,
        ask: u64,
        owner: address,
    }

    /// Create a new shared Marketplace.
    public entry fun create<COIN>(ctx: &mut TxContext) {
        let id = object::new(ctx);
        transfer::share_object(Marketplace<COIN> { id })
    }

    /// List an item at the Marketplace.
    public entry fun list<T: key + store, COIN>(
        marketplace: &mut Marketplace<COIN>,
        item: T,
        ask: u64,
        ctx: &mut TxContext
    ) {
        let item_id = object::id(&item);
        let listing = Listing {
            ask,
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
        };

        ofield::add(&mut listing.id, true, item);
        ofield::add(&mut marketplace.id, item_id, listing)
    }

    /// Remove listing and get an item back. Only owner can do that.
    public fun delist<T: key + store, COIN>(
        marketplace: &mut Marketplace<COIN>,
        item_id: ID,
        ctx: &TxContext
    ): T {
        let Listing {
            id,
            owner,
            ask: _,
        } = ofield::remove(&mut marketplace.id, item_id);

        assert!(tx_context::sender(ctx) == owner, ENotOwner);

        let item = ofield::remove(&mut id, true);
        object::delete(id);
        item
    }

    public entry fun delist_and_take<T: key + store, COIN>(
        marketplace: &mut Marketplace<COIN>,
        item_id: ID,
        ctx: &TxContext
    ) {
        let item = delist<T, COIN>(marketplace, item_id, ctx);
        transfer::public_transfer(item, tx_context::sender(ctx));
    }

    public fun buy<T: key + store, COIN>(
        marketplace: &mut Marketplace<COIN>,
        item_id: ID,
        paid: Coin<COIN>,
    ): T {
        let Listing {
            id,
            ask,
            owner
        } = ofield::remove(&mut marketplace.id, item_id);

        assert!(ask == coin::value(&paid), EAmountIncorrect);
        // Check if there's already a Coin hanging and merge `paid` with it.
        // Otherwise attach `paid` to the `Marketplace` under owner's `address`.
        if (ofield::exists_<address>(&marketplace.id, owner)) {
            coin::join(
                ofield::borrow_mut<address, Coin<COIN>>(&mut marketplace.id, owner),
                paid
            )
        } else {
            ofield::add(&mut marketplace.id, owner, paid)
        };

        let item = ofield::remove(&mut id, true);
        object::delete(id);
        item
    }

    /// Call [`buy`] and transfer item to the sender.
    public entry fun buy_and_take<T: key + store, COIN>(
        marketplace: &mut Marketplace<COIN>,
        item_id: ID,
        paid: Coin<COIN>,
        ctx: &TxContext
    ) {
        transfer::public_transfer(
            buy<T, COIN>(marketplace, item_id, paid),
            tx_context::sender(ctx)
        )
    }

    /// Take profits from selling items on the `Marketplace`.
    public fun take_profits<COIN>(
        marketplace: &mut Marketplace<COIN>,
        ctx: &TxContext
    ): Coin<COIN> {
        ofield::remove<address, Coin<COIN>>(&mut marketplace.id, tx_context::sender(ctx))
    }

    /// Call [`take_profits`] and transfer Coin to the sender.
    public entry fun take_profits_and_keep<COIN>(
        marketplace: &mut Marketplace<COIN>,
        ctx: &TxContext
    ) {
        transfer::public_transfer(
            take_profits(marketplace, ctx),
            tx_context::sender(ctx)
        )
    }
}


module booknft::book_nft {
    use sui::url::{Self, Url};
    use std::string;
    use sui::object::{Self, ID, UID};
    use sui::event;
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    struct BookNFT has key, store {
        id: UID,
        title: string::String,
        author: address,
        description:  string::String,
        content: string::String,
        url: Url,

    }

    struct NFTMinted has copy, drop {

        object_id: ID,
        creator: address,
        name: string::String,
    }


    public fun name(nft: &BookNFT): &string::String {
        &nft.title
    }

    public fun description(nft: &BookNFT): &string::String {
        &nft.description
    }

    public fun content(nft: &BookNFT): &string::String {
        &nft.content
    }

    public fun url(nft: &BookNFT): &Url {
        &nft.url
    }

    public entry fun mint_to_sender(
        title: vector<u8>,
        description: vector<u8>,
        content: vector<u8>,
        url: vector<u8>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let nft = BookNFT {
            id: object::new(ctx),
            title: string::utf8(title),
            description: string::utf8(description),
            content: string::utf8(content),
            author: sender,
            url: url::new_unsafe_from_bytes(url)
        };

        event::emit(NFTMinted {
            object_id: object::id(&nft),
            creator: sender,
            name: nft.title,
        });

        transfer::public_transfer(nft, sender);
    }

    public entry fun transfer(
        nft: BookNFT, recipient: address, _: &mut TxContext
    ) {
        transfer::public_transfer(nft, recipient)
    }

    public entry fun update_description(
        nft: &mut BookNFT,
        new_description: vector<u8>,
        _: &mut TxContext
    ) {
        nft.description = string::utf8(new_description)
    }

    public entry fun burn(nft: BookNFT, _: &mut TxContext) {
        let BookNFT { id, title: _,author: _, description: _, content: _, url: _ } = nft;
        object::delete(id)
    }
}
