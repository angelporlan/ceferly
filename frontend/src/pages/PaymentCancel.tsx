import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { XCircle, ArrowLeft } from 'lucide-react'

export const PaymentCancel: React.FC = () => {
  return (
    <div className="max-w-md mx-auto text-center py-12">
      <Card className="p-8 flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-slate-100 text-slateText-muted flex items-center justify-center">
          <XCircle className="w-12 h-12" />
        </div>

        <h1 className="text-2xl font-black text-slateText-main">Pago Cancelado</h1>
        <p className="text-xs font-bold text-slateText-muted">
          El proceso de suscripción se ha cancelado. No se ha realizado ningún cobro en tu tarjeta.
        </p>

        <Link to="/shop" className="w-full mt-2">
          <Button variant="secondary" size="lg" fullWidth leftIcon={<ArrowLeft className="w-5 h-5" />}>
            Volver a la tienda
          </Button>
        </Link>
      </Card>
    </div>
  )
}
