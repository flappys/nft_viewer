import React, { useEffect, useState } from 'react';

// State
import { useSelector, useDispatch } from 'react-redux';
import { changeChainTab, chainTabState } from '../../../state/tab/tabSlice';
import { settingsState } from '../../../state/settings/settingsSlice';

// Data
import { useInfiniteQuery } from 'react-query';
import axios from 'axios';
import chains from '../../../data'; // placeholder data

// Chakra UI
import { Button, Alert, AlertIcon } from '@chakra-ui/react';
import { ChevronDownIcon, AddIcon, ExternalLinkIcon } from '@chakra-ui/icons';

// Components
import NFTCard from '../../NFTCard/NFTCard';

interface ChainProps {
  name: string;
  abbr: string;
  loaded: boolean;
  count: number;
  order: number;
  total: number;
}

interface Chains {
  [key: string]: ChainProps;
}

interface Props {
  chain: string;
  chainTabSet: boolean;
  chains: Chains;
  q: string;
  location: Location;
  //onChains: Function;
  //onChainTabSet: onChainTabSet
}

function SearchChainData(props) {
  // State
  const dispatch = useDispatch();
  const settings = useSelector(settingsState);

  const chain = props.chain;

  const fetchNfts = async ({ pageParam = 0 }) => {
    // reset UI state
    // only reset chain states when it's a fresh query, not more NFTs loaded to each tab
    if (pageParam == 0) {
      dispatch(changeChainTab(-1));
      props.onChainTabSet(false);
    }

    props.onChains({
      name: chains[chain]['name'],
      abbr: chain,
      order: chains[chain]['order'],
      loaded: false,
      count: 0,
    });

    const { data } = await axios(
      `/api/nfts/search/chain/${chain}/q/${props.q}/filter/${settings.searchFilter}/limit/${settings.searchLimit}/offset/` +
        pageParam
    );

    //console.log('response', data);

    const nftCount = Object.values(data).flat().length;

    // React Query
    const offset = pageParam + settings.searchLimit; // manually increase each "page" by the limit

    return {
      [chain]: {
        name: chains[chain]['name'],
        abbr: chain,
        order: chains[chain]['order'],
        data,
        loaded: true,
        count: nftCount,
        total: nftCount,
      },
      offset,
    };
  };

  // infinite queries
  const {
    data,
    error,
    isLoading,
    isError,
    isSuccess,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    // } = useInfiniteQuery('nftMetadata', fetchNfts, {
    //} = useInfiniteQuery(['search', props.q, props.chain], fetchNfts, {
  } = useInfiniteQuery(
    ['search', props.location, props.q, props.chain],
    fetchNfts,
    {
      getNextPageParam: (lastPage) => {

        console.log("lastPage", lastPage)
        if (Object.keys(lastPage[chain].data).length > 0) return lastPage.offset; // only allow up to 100 pages / 500 offsets
      },
    }
  );

  useEffect(() => {
    if (data) {
      const nftTotals = data.pages.reduce((acc, element) => {
        const nftCount = Object.values(element)[0].count;

        return acc + nftCount;
      }, 0);

      data.pages[0][chain].total = nftTotals;

      props.onChains(data.pages[0][chain]);

      // set the chain tab to one that has NFTs and only set it once i.e. the first loaded tab
      /*if (data.pages[0][chain].count > 0 && !props.chainTabSet) {
        //console.log('setting chain tab', chains[chain].order);
        console.log('current tab setting');
        //dispatch(changeChainTab(chains[chain].order));
        //props.onChainTabSet(true);
      } */
    }
  }, [data]);

  if (!isSuccess) {
    return null;
  }

  return (
    <>
      <div className="grid gap-5">
        <section className={`space-y-2`}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 4xl:grid-cols-8 gap-10">
            {data.pages.map((page) => (
              <React.Fragment key={page.offset}>
                {page[chain].data.map((nft, idx) => (
                  <NFTCard key={idx} nft={nft} chain={chain} />
                ))}
              </React.Fragment>
            ))}
          </div>
        </section>
      </div>

      <div className="text-center mt-5">
        {hasNextPage ? (
          <Button
            type="submit"
            onClick={() => fetchNextPage()}
            disabled={!hasNextPage || isFetchingNextPage}
            isLoading={isFetchingNextPage}
            loadingText="Loading"
            spinnerPlacement="end"
            colorScheme="blue"
            lineHeight="1"
          >
            Load More +{settings.searchLimit}
          </Button>
        ) : (
          <Alert status="error">
            <AlertIcon />
            Limit reached.
          </Alert>
        )}
      </div>
    </>
  );
}

export default React.memo(SearchChainData);
