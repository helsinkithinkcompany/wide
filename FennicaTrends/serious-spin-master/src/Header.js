import React from 'react'
import Logo from './assets/cloud-logo.png'
import './Header.css'

const Header = () =>
  <div className='Header'>
    <img className='Header__logo' src={Logo} alt='Cloud logo'/>
    <div className='Header__title'>FennicaTrends</div>
  </div>

export default Header
