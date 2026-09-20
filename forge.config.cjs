module.exports = {
  packagerConfig: {
    asar: true,
    name: 'Kiddy Clash',
    executableName: 'KiddyClash',
  },
  makers: [
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32'],
    },
  ],
}
