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
import { useToast, Button, Alert, AlertIcon } from '@chakra-ui/react';
import { ChevronDownIcon, AddIcon, ExternalLinkIcon } from '@chakra-ui/icons';

// Components
import NFTCollection from '../../NFTCollection/NFTCollection';
import NFTCard from '../../NFTCard/NFTCard';
import toast from '../../../components/Toast/Toast';

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
  wallet: string;
  //onChains: Function;
  //onChainTabSet: onChainTabSet
}

function UserChainData(props) {
  // State
  const settings = useSelector(settingsState);

  const toastInstance = useToast();

  const chain = props.chain;

  const fetchNfts = async ({ pageParam = "" }) => {
    // reset UI state
    // only reset chain states when it's a fresh query, not more NFTs loaded to each tab
    /* if (pageParam === "") {
      console.log("no start param ")
      dispatch(changeChainTab(-1));
      props.onChainTabSet(false);
    } */

    props.onChains({
      name: chains[chain]['name'],
      abbr: chain,
      order: chains[chain]['order'],
      loaded: false,
      count: 0,
    });

    const { data } = await axios.get(
      `/api/nfts?chain=${chain}&address=${props.wallet}&limit=${settings.walletLimit}`
    );
    
    console.log("Data:", data);

    const nftCount = Object.keys(data).length;

    console.log("nftCount:", nftCount);

    const collections = Object.keys(data);

    console.log("collections: ", collections);

    return {
      [chain]: {
        name: chains[chain]['name'],
        abbr: chain,
        order: chains[chain]['order'],
        data,
        loaded: true,
        count: nftCount,
        total: nftCount,
      }
    };
  };

  const {
    data,
    error,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    ['userNfts', props.location, props.wallet, props.chain],
    fetchNfts,
    {
      retry: 1,
      getNextPageParam: (lastPage) => lastPage[chain].data.cursor // only return valid cursor if not empty, otherwise return undefined to make this the last page,
    }
  );

  useEffect(() => {
    if (data) {

      const nftTotals = data.pages.reduce((acc, element) => {
        const nftCount = Object.values(element)[0]["count"];

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

  useEffect(() => {
    if (error) {
      const noData = {
        name: chains[chain]['name'],
        abbr: chain,
        order: chains[chain]['order'],
        data: {
          data
        },
        loaded: true,
        count: 0,
        total: 0,
      }

      props.onChains(noData);

      toast(
        toastInstance,
        'error',
        'Invalid address.',
      );
    }
  }, [error])

  if (!data) return null;

  

  console.log("data11: ", data);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 4xl:grid-cols-8 gap-10">
        {data.pages.map((page) => {
         if(page[chain].data == null) return null;
          return Object.keys(page[chain].data).map((collection) => (
            <>
            <NFTCollection
              key={collection}
              collection={page[chain].data[collection]}
              type={page[chain].data}
              chain={chain}
            />
            </>

          ));
        })}
      </div>

      <div className="text-center mt-5">
        {hasNextPage && (
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
            Load More +{settings.walletLimit}
          </Button>
        )}
      </div>
    </>
  );
}

export default React.memo(UserChainData);

/*
 : (
          <Alert status="error">
            <AlertIcon />
            No more NFTs.
          </Alert>
        )
        */