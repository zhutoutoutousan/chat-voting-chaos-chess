import LoginForm from "@/components/LoginForm"
import { ConstructionNotice } from "@/components/ui/construction-notice"

export default function LoginPage() {
  return (
    <div>
      <LoginForm />
      
      <div className="container mx-auto px-4">
        <ConstructionNotice />
      </div>
    </div>
  )
} 