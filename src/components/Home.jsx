import React from 'react'
import { BackgroundBoxesDemo } from '../../UI/BackgroundBoxesDemo'
import {SparklesPreview} from '../../UI/SparklesPreview'

import Hero from './Hero.jsx';
const Home = () => {
  return (
    <div>
      <BackgroundBoxesDemo></BackgroundBoxesDemo>
      <SparklesPreview></SparklesPreview>
      <Hero/>
    </div>
  )
}

export default Home
