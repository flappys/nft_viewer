import { Link } from 'react-router-dom';

import NFTCard from '../NFTCard/NFTCard';

export default function NFTCollection(props) {
  const collection = props.collection;
  const chain = props.chain;

  return (
    <>

        {collection.map((nft, idx) => (
          <NFTCard key={idx} nft={nft} chain={chain} />
        ))}

    </>
  );
}

/*
<section className={`space-y-2`}>
      {!props.type.type &&
      <h3 className="text-left text-lg font-semibold">
        <Link to={`/${chain}/collection/${collection[0].token_address}`}>
          {collection[0].name ? collection[0].name : 'Unnamed Collection'}
        </Link>
      </h3>
      }
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 4xl:grid-cols-8 gap-10">
        {collection.map((nft, idx) => (
          <NFTCard key={idx} nft={nft} chain={chain} />
        ))}
      </div>
    </section>
    */