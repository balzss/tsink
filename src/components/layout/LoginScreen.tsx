import { useTranslation } from 'react-i18next'
import { requestLogin } from '@/api/google-auth'
import { useSettingsStore } from '@/stores/settings-store'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function LoginScreen() {
  const { t, i18n } = useTranslation()
  const setLanguage = useSettingsStore((s) => s.setLanguage)

  function handleLanguageChange(code: string) {
    setLanguage(code)
    i18n.changeLanguage(code)
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-6 gradient-bg">
      <div className="glass rounded-2xl p-8 flex flex-col items-center gap-6 max-w-sm w-full">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">{t('login.title')}</h1>
          <p className="mt-2 text-white/70">{t('login.subtitle')}</p>
        </div>
        <Button
          size="lg"
          onClick={requestLogin}
          className="bg-white text-primary-800 hover:bg-white/90 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] gradient-emerald-none"
          style={{ background: 'white' }}
        >
          {t('login.signIn')}
        </Button>
        <p className="text-xs text-white/50">{t('login.description')}</p>
        <Select value={i18n.language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-full bg-white/20 border-white/30 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="hu">Magyar</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
