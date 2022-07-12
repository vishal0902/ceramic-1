import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import {Web3Provider} from '@ethersproject/providers'
import { useState, useEffect, useRef } from 'react'
import Web3Modal from 'web3modal'
import {useViewerConnection } from '@self.id/react'
import {EthereumAuthProvider} from '@self.id/web'

export default function Home() {

  const web3ModalRef = useRef();
  const [connection, connect, disconnect] = useViewerConnection();
  const getProvider = async() => {
    const provider = await web3ModalRef.current.connect();
    const wrappedProvider = new Web3Provider(provider);
    return wrappedProvider; 
  }


  useEffect(()=>{
    if(connection.status!=='connected'){
      web3ModalRef.current = new Web3Modal({
        network : "rinkeby",
        providerOptions : {},
        disableInjectedProvider : false
      });
    }
  },[connection.status]);


  const connectToSelfID = async () => {
    const ethereumAuthProvider = await getEthereumAuthProvider();
    connect(ethereumAuthProvider);
  }


  const getEthereumAuthProvider = async () => {
    const wrappedProvider = await getProvider();
    const signer = wrappedProvider.getSigner();
    const address = await signer.getAddress();
    return new EthereumAuthProvider(wrappedProvider.provider, address); 
  }

  return (
    <div className={styles.main}>
      <div className={styles.navbar}>
        <span className={styles.title}>Ceramic Demo</span>
        {connection.status === "connected" ? (
          <span className={styles.subtitle}>Connected</span>
        ) : (
          <button
            onClick={connectToSelfID}
            className={styles.button}
            disabled={connection.status === "connecting"}
          >
            Connect
          </button>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.connection}>
          {connection.status === "connected" ? (
            <div>
              <span className={styles.subtitle}>
                Your 3ID is {connection.selfID.id}
              </span>
              <RecordSetter />
            </div>
          ) : (
            <span className={styles.subtitle}>
              Connect with your wallet to access your 3ID
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

import { useViewerRecord } from "@self.id/react";

function RecordSetter() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");

  const record = useViewerRecord("basicProfile");

 const updateRecord = async () => {
    await record.merge({
      name: name,
      age: age
    });
    setAge("");
    setName("");
  };  

  return (
    <div className={styles.content}>
      <div className={styles.mt2}>
        {record.content ? (
          <div className={styles.flexCol}>
            <span className={styles.subtitle}>
              Hello {record.content.name}!
            </span>
            <span className={styles.subtitle}>
              Your Age is {record.content.age}.
            </span>

            <span>
              The above name was loaded from Ceramic Network. Try updating it
              below.
            </span>
          </div>
        ) : (
          <span>
            You do not have a profile record attached to your 3ID. Create a
            basic profile by setting a name below.
          </span>
        )}
      </div>

      <label>Name:</label>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={styles.mt2}
      />
      <label>Age:</label>
      <input
        type="text"
        placeholder="Age"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        className={styles.mt2}
      />
      
      <button onClick={() => updateRecord()}>Update</button>
    </div>
  );
}
