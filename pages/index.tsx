import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import myNFT from "../src/utils/MyNFT.json";

// import twitterLogo from "src/assets/twitter-logo.svg";
// import styles from '../styles/Home.module.css'

//コントラクトアドレス
const CONTRACT_ADDRESS = "0x842BDfd7da2d603b176f0E41B58a6f2D785aFBcA";

const Home = () => {
  const [firstText, setFirstText] = useState("");
  const [secondText, setSecondText] = useState("");
  const [thirdText, setThirdText] = useState("");
  const [openseaURL, setOpenseaURL] = useState("");

  //現在のアカウント
  const [currentAccount, setCurrentAccount] = useState("");
  console.log("currentAccount: ", currentAccount);

  //ユーザがメタマスクを持っているか確認
  const checkIfWalletIsConnected = async () => {
    //windowの中にethereumというものがあるらしい
    //MetaMask injects a global API into websites visited by its users at window.ethereum
    const { ethereum } = window as any;
    if (!ethereum) {
      console.log("Make sure you have MetaMask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    //メタマスクのアカウントリストを要求
    const accounts = await ethereum.request({ method: "eth_accounts" });
    //1つでも持っていれば１つ目をアカウントとして取得
    if (accounts.length != 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      // currentAccountにユーザーのアカウントアドレスを格納
      setCurrentAccount(account);
      setupEventListener();
    } else {
      console.log("No authorized account found");
    }
  };

  //walletに接続する関数
  const connectWallet = async () => {
    try {
      const { ethereum } = window as any;
      //metamaskがなければアラート
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      //アカウントをゲット
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      //ネットワークの確認
      let chainId = await ethereum.request({ method: "eth_chainId" });
      console.log("Connected to chain " + chainId);
      //0x4はRinkebyのID
      const rinkebyChainId = "0x4";
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test Network!");
      }

      //イベントリスナー
      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };

  const setupEventListener = async () => {
    try {
      const { ethereum } = window as any;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        // NFT が発行されます。
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myNFT.abi,
          signer
        );
        // Event が　emit される際に、コントラクトから送信される情報を受け取っています。
        connectedContract.on("NewMyNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(
            `あなたのウォレットに NFT を送信しました。OpenSea に表示されるまで最大で10分かかることがあります。NFT へのリンクはこちらです: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
          setOpenseaURL(
            `https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
        });
        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  //NFTをミントするボタン
  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window as any;
      if (ethereum) {
        //providerを作成
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        //コントラクトに悪世するするためのオブジェクトを作成
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myNFT.abi,
          signer
        );
        console.log("Going to pop wallet now to pay gas...");
        //関数を呼ぶ
        let nftTxn = await connectedContract.makeMyNFT(
          firstText,
          secondText,
          thirdText
        );
        console.log("Mining...please wait.");
        //トランザクションの終了を待つ
        await nftTxn.wait();

        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // renderNotConnectedContainer メソッドを定義します。
  const renderNotConnectedContainer = () => (
    <button className="m-4">Connect to Wallet from top-right button!!</button>
  );

  //読み込まれたときにwalletがつながっているかチェック
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <>
      <Head>
        <title>3 words NFT onChain!</title>
      </Head>
      <div className="bg-gray-800 h-screen">
        <header className="bg-red-200 h-[10%] flex justify-center items-center relative">
          <div className=" bg-red-400 text-white	text-4xl	p-4 flex rounded-md">
            3 words OnChain
            <div className="text-red-600">N</div>
            <div className="text-yellow-500">F</div>
            <div className="text-blue-600">T</div>
            Maker
          </div>
          {currentAccount === "" ? (
            <button
              className="absolute right-0 m-4 border-solid border-2 p-2 rounded-md bg-gray-200 border-emerald-500 hover:bg-gray-400 "
              onClick={connectWallet}
            >
              ConnectWallet
            </button>
          ) : (
            <div className="absolute right-0 m-4 border-solid border-2 p-2 rounded-md bg-gray-200 border-emerald-500 hover:bg-gray-400 ">
              Wallet Connected!!
            </div>
          )}
        </header>
        <main className="h-[80%]">
          <div className="h-full flex flex-col">
            {/* <div className="h-full bg-yellow-400">main</div> */}
            <div className="h-full flex flex-col items-center justify-center bg-yellow-200">
              {/* <div className="m-4">walletが接続されていないよ．．．</div> */}
              {currentAccount === "" ? (
                renderNotConnectedContainer()
              ) : (
                <div></div>
              )}
              {/* // {renderNotConnectedContainer()} */}
              <div className="text-lg	">３つの単語を入れてね！</div>
              <input
                className="m-4 border-2 border-red-400 rounded-md"
                value={firstText}
                onChange={(event) => setFirstText(event.target.value)}
              />
              <input
                className="m-4 border-2 border-yellow-400 rounded-md"
                value={secondText}
                onChange={(event) => setSecondText(event.target.value)}
              />
              <input
                className="m-4 border-2 border-blue-400 rounded-md"
                value={thirdText}
                onChange={(event) => setThirdText(event.target.value)}
              />
              {currentAccount === "" ||
              firstText === "" ||
              secondText === "" ||
              thirdText === "" ? (
                <button className="m-4 border-solid border-1 p-2 rounded-md bg-gray-200 hover:bg-gray-400 border-emerald-500">
                  NFTを作成！
                </button>
              ) : (
                <button
                  className="m-4 border-solid border-1 p-2 rounded-md bg-gray-200 hover:bg-gray-400 border-emerald-500"
                  onClick={askContractToMintNft}
                >
                  NFTを作成！
                </button>
              )}
              {openseaURL === "" ? (
                <div></div>
              ) : (
                <div className="flex m-4">
                  <div className="">Opensea：</div>
                  <a
                    className="text-blue-600"
                    target="_blank"
                    href={openseaURL}
                  >
                    {openseaURL}
                  </a>
                </div>
              )}
            </div>
          </div>
        </main>
        {/* flex justify-center */}
        <footer className="bg-blue-200 h-[10%] flex flex-col justify-center items-center">
          <div className="flex items-center">
            <div className="">Creater</div>
            <Image src="/images/twitter-logo.svg" width={32} height={32} />{" "}
            <div>：</div>
            <a
              className="text-blue-600 text-lg"
              href="https://twitter.com/web5_"
              target="_blank"
            >
              @web5_
            </a>
          </div>
          {/* <div>２</div>
          <div>３</div> */}
        </footer>
      </div>
    </>
    // <>
    //   <Head>
    //     <title>3 words NFT onChain!</title>
    //   </Head>
    //   <div className="bg-gray-800 h-screen flex flex-col">
    //     <header className="bg-gray-400 h-16">ヘッダー</header>
    //     <main className="h-full flex-auto">
    //       <div className="flex h-full bg-yellow-100">
    //         <div className="bg-red-400 w-4/5">main</div>
    //         <div className="bg-yellow-400 w-1/5">side</div>
    //       </div>
    //     </main>
    //     <footer className="bg-green-800 h-16">フッター</footer>
    //   </div>
    // </>
    // <div className="relative bg-white overflow-hidden">
    //   <div className="max-w-7xl mx-auto">
    //     <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
    //       <svg
    //         className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
    //         fill="currentColor"
    //         viewBox="0 0 100 100"
    //         preserveAspectRatio="none"
    //         aria-hidden="true"
    //       >
    //         <polygon points="50,0 100,0 50,100 0,100" />
    //       </svg>

    //       <div>
    //         <div className="relative pt-6 px-4 sm:px-6 lg:px-8">
    //           <nav
    //             className="relative flex items-center justify-between sm:h-10 lg:justify-start"
    //             aria-label="Global"
    //           >
    //             <div className="flex items-center flex-grow flex-shrink-0 lg:flex-grow-0">
    //               <div className="flex items-center justify-between w-full md:w-auto">
    //                 <a href="#">
    //                   <span className="sr-only">Workflow</span>
    //                   <img
    //                     alt="Workflow"
    //                     className="h-8 w-auto sm:h-10"
    //                     src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
    //                   />
    //                 </a>
    //                 <div className="-mr-2 flex items-center md:hidden">
    //                   <button
    //                     type="button"
    //                     className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
    //                     aria-expanded="false"
    //                   >
    //                     <span className="sr-only">Open main menu</span>
    //                     {/* <!-- Heroicon name: outline/menu --> */}
    //                     <svg
    //                       className="h-6 w-6"
    //                       xmlns="http://www.w3.org/2000/svg"
    //                       fill="none"
    //                       viewBox="0 0 24 24"
    //                       stroke-width="2"
    //                       stroke="currentColor"
    //                       aria-hidden="true"
    //                     >
    //                       <path
    //                         stroke-linecap="round"
    //                         stroke-linejoin="round"
    //                         d="M4 6h16M4 12h16M4 18h16"
    //                       />
    //                     </svg>
    //                   </button>
    //                 </div>
    //               </div>
    //             </div>
    //             <div className="hidden md:block md:ml-10 md:pr-4 md:space-x-8">
    //               <a
    //                 href="#"
    //                 className="font-medium text-gray-500 hover:text-gray-900"
    //               >
    //                 Product
    //               </a>

    //               <a
    //                 href="#"
    //                 className="font-medium text-gray-500 hover:text-gray-900"
    //               >
    //                 Features
    //               </a>

    //               <a
    //                 href="#"
    //                 className="font-medium text-gray-500 hover:text-gray-900"
    //               >
    //                 Marketplace
    //               </a>

    //               <a
    //                 href="#"
    //                 className="font-medium text-gray-500 hover:text-gray-900"
    //               >
    //                 Company
    //               </a>

    //               <a
    //                 href="#"
    //                 className="font-medium text-indigo-600 hover:text-indigo-500"
    //               >
    //                 Log in
    //               </a>
    //             </div>
    //           </nav>
    //         </div>

    //         {/* <!--
    //       Mobile menu, show/hide based on menu open state.

    //       Entering: "duration-150 ease-out"
    //         From: "opacity-0 scale-95"
    //         To: "opacity-100 scale-100"
    //       Leaving: "duration-100 ease-in"
    //         From: "opacity-100 scale-100"
    //         To: "opacity-0 scale-95"
    //     --> */}
    //         <div className="absolute z-10 top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden">
    //           <div className="rounded-lg shadow-md bg-white ring-1 ring-black ring-opacity-5 overflow-hidden">
    //             <div className="px-5 pt-4 flex items-center justify-between">
    //               <div>
    //                 <img
    //                   className="h-8 w-auto"
    //                   src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
    //                   alt=""
    //                 />
    //               </div>
    //               <div className="-mr-2">
    //                 <button
    //                   type="button"
    //                   className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
    //                 >
    //                   <span className="sr-only">Close main menu</span>
    //                   {/* <!-- Heroicon name: outline/x --> */}
    //                   <svg
    //                     className="h-6 w-6"
    //                     xmlns="http://www.w3.org/2000/svg"
    //                     fill="none"
    //                     viewBox="0 0 24 24"
    //                     stroke-width="2"
    //                     stroke="currentColor"
    //                     aria-hidden="true"
    //                   >
    //                     <path
    //                       stroke-linecap="round"
    //                       stroke-linejoin="round"
    //                       d="M6 18L18 6M6 6l12 12"
    //                     />
    //                   </svg>
    //                 </button>
    //               </div>
    //             </div>
    //             <div className="px-2 pt-2 pb-3 space-y-1">
    //               <a
    //                 href="#"
    //                 className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
    //               >
    //                 Product
    //               </a>

    //               <a
    //                 href="#"
    //                 className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
    //               >
    //                 Features
    //               </a>

    //               <a
    //                 href="#"
    //                 className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
    //               >
    //                 Marketplace
    //               </a>

    //               <a
    //                 href="#"
    //                 className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
    //               >
    //                 Company
    //               </a>
    //             </div>
    //             <a
    //               href="#"
    //               className="block w-full px-5 py-3 text-center font-medium text-indigo-600 bg-gray-50 hover:bg-gray-100"
    //             >
    //               {" "}
    //               Log in{" "}
    //             </a>
    //           </div>
    //         </div>
    //       </div>

    //       <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
    //         <div className="sm:text-center lg:text-left">
    //           <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
    //             <span className="block xl:inline">Data to enrich your</span>
    //             <span className="block text-indigo-600 xl:inline">
    //               online business
    //             </span>
    //           </h1>
    //           <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
    //             Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui
    //             lorem cupidatat commodo. Elit sunt amet fugiat veniam occaecat
    //             fugiat aliqua.
    //           </p>
    //           <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
    //             <div className="rounded-md shadow">
    //               <a
    //                 href="#"
    //                 className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
    //               >
    //                 {" "}
    //                 Get started{" "}
    //               </a>
    //             </div>
    //             <div className="mt-3 sm:mt-0 sm:ml-3">
    //               <a
    //                 href="#"
    //                 className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10"
    //               >
    //                 {" "}
    //                 Live demo{" "}
    //               </a>
    //             </div>
    //           </div>
    //         </div>
    //       </main>
    //     </div>
    //   </div>
    //   {/* 画面右の画像 */}
    //   <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
    //     <img
    //       className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
    //       src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80"
    //       alt=""
    //     />
    //   </div>
    // </div>
  );
};

export default Home;
// const Home: NextPage = () => {
//   return (
//     <div classNameName={styles.container}>
//       <Head>
//         <title>Create Next App</title>
//         <meta name="description" content="Generated by create next app" />
//         <link rel="icon" href="/favicon.ico" />
//       </Head>

//       <main classNameName={styles.main}>
//         <h1 classNameName={styles.title}>
//           Welcome to <a href="https://nextjs.org">Next.js!</a>
//         </h1>

//         <p classNameName={styles.description}>
//           Get started by editing{' '}
//           <code classNameName={styles.code}>pages/index.tsx</code>
//         </p>

//         <div classNameName={styles.grid}>
//           <a href="https://nextjs.org/docs" classNameName={styles.card}>
//             <h2>Documentation &rarr;</h2>
//             <p>Find in-depth information about Next.js features and API.</p>
//           </a>

//           <a href="https://nextjs.org/learn" classNameName={styles.card}>
//             <h2>Learn &rarr;</h2>
//             <p>Learn about Next.js in an interactive course with quizzes!</p>
//           </a>

//           <a
//             href="https://github.com/vercel/next.js/tree/canary/examples"
//             classNameName={styles.card}
//           >
//             <h2>Examples &rarr;</h2>
//             <p>Discover and deploy boilerplate example Next.js projects.</p>
//           </a>

//           <a
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
//             classNameName={styles.card}
//           >
//             <h2>Deploy &rarr;</h2>
//             <p>
//               Instantly deploy your Next.js site to a public URL with Vercel.
//             </p>
//           </a>
//         </div>
//       </main>

//       <footer classNameName={styles.footer}>
//         <a
//           href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Powered by{' '}
//           <span classNameName={styles.logo}>
//             <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
//           </span>
//         </a>
//       </footer>
//     </div>
//   )
// }

// export default Home
