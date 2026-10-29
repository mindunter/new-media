import { useEffect } from 'react'
import { AllLaunches } from './components/AllLaunches'
import { Cases } from './components/Cases'
import { Contact } from './components/Contact'
import { Engine } from './components/Engine'
import { Faq } from './components/Faq'
import { Manifesto } from './components/Manifesto'
import { Network } from './components/Network'
import { Platforms } from './components/Platforms'
import { Services } from './components/Services'
import { Simulator } from './components/Simulator'

/** Sections below the fold, split into their own chunk. */
export default function Below() {
  useEffect(() => {
    // A deep link like /#simulator can only resolve once these sections exist.
    if (location.hash.length > 1) document.querySelector(location.hash)?.scrollIntoView()
  }, [])

  return (
    <>
      <Platforms />
      <Engine />
      <Network />
      <Services />
      <Cases />
      <AllLaunches />
      <Simulator />
      <Manifesto />
      <Faq />
      <Contact />
    </>
  )
}
