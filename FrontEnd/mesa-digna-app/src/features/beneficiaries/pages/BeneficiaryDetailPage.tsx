import {useState, useEffect} from 'react';
import {useParams, Link} from 'react-router';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPen, faHeartPulse} from '@fortawesome/free-solid-svg-icons';
import {useAuth} from '@/app/providers/AuthProvider';
import {usePageTitle} from '@/hooks/usePageTitle';
import {Loader, Card, Badge, Button} from '@/components/ui';
import {beneficiaryService} from '../services/beneficiary.service';
import {healthProfileService} from '@/features/health-profiles/services/healthProfile.service';
import {formatDate} from '@/utils/formatDate';
import type {BeneficiaryResponse} from '../types/beneficiary.types';
import type {HealthProfileResponse} from '@/features/health-profiles/types/healthProfile.types';

function getStatusVariant(status: string): 'active' | 'inactive' | 'suspended' | 'info' {
    switch (status) {
        case 'Activo':
            return 'active';
        case 'Inactivo':
            return 'inactive';
        case 'Suspendido':
            return 'suspended';
        default:
            return 'info';
    }
}

function Field({label, value}: { label: string; value: React.ReactNode }) {
    return (<div>
        <dt className="text-xs text-text-secondary font-medium uppercase tracking-wider mb-0.5">{label}</dt>
        <dd className="text-sm text-text-primary">{value || '—'}</dd>
    </div>);
}

const formatIdentityDocument = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);

    if (digits.length <= 3) return digits;
    if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3)}`;

    return `${digits.slice(0, 3)}-${digits.slice(3, 10)}-${digits.slice(10)}`;
};

export default function BeneficiaryDetailPage() {
    const {id} = useParams();
    const {canManageBeneficiaries} = useAuth();
    const [beneficiary, setBeneficiary] = useState<BeneficiaryResponse | null>(null);
    const [healthProfile, setHealthProfile] = useState<HealthProfileResponse | null>(null);
    const [loading, setLoading] = useState(true);
    usePageTitle(beneficiary?.fullName || 'Detalle beneficiario');

    useEffect(() => {
        if (!id) return;
        const bid = Number(id);
        Promise.all([
            beneficiaryService.getById(bid).then(res => {
                if (res.success && res.data) setBeneficiary(res.data);
            }),
            healthProfileService.getByBeneficiary(bid).then(res => {
                if (res.success && res.data) setHealthProfile(res.data);
            }).catch(() => {
            }),
        ]).finally(() => setLoading(false));
    }, [id]);

    if (loading) return <Loader message="Cargando beneficiario..."/>;
    if (!beneficiary) return <div className="text-center py-12 text-text-secondary">Beneficiario no encontrado.</div>;

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">{beneficiary.fullName}</h1>
                    <p className="text-sm text-text-secondary mt-1">Código: {beneficiary.internalCode}</p>
                </div>
                {canManageBeneficiaries && (
                    <div className="flex gap-2">
                        <Link to={`/beneficiarios/${id}/editar`}><Button variant="secondary" size="sm"><FontAwesomeIcon
                            icon={faPen} className="mr-1.5"/>Editar</Button></Link>
                        <Link to={`/beneficiarios/${id}/salud`}><Button variant="secondary" size="sm"><FontAwesomeIcon
                            icon={faHeartPulse} className="mr-1.5"/>Perfil de salud</Button></Link>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Información personal">
                    <dl className="grid grid-cols-2 gap-4">
                        <Field label="Nombre completo" value={beneficiary.fullName}/>
                        <Field label="Código interno" value={<code
                            className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{beneficiary.internalCode}</code>}/>
                        <Field label="Fecha de nacimiento" value={formatDate(beneficiary.dateOfBirth)}/>
                        <Field label="Edad" value={`${beneficiary.age} años`}/>
                        <Field label="Sexo" value={beneficiary.sex}/>
                        <Field label="Documento" value={beneficiary.identityDocument ? formatIdentityDocument(beneficiary.identityDocument) : '—'}/>
                        <Field label="Teléfono" value={beneficiary.phoneNumber}/>
                        <Field label="Dirección" value={beneficiary.address}/>
                        <Field label="Contacto emergencia" value={beneficiary.emergencyContact}/>
                        <Field label="Estado" value={<Badge
                            variant={getStatusVariant(beneficiary.status)}>{beneficiary.status}</Badge>}/>
                        <Field label="Fecha registro" value={formatDate(beneficiary.registeredAt)}/>
                    </dl>
                    {beneficiary.notes && (<div className="mt-4 pt-4 border-t border-gray-100"><Field label="Notas"
                                                                                                      value={beneficiary.notes}/>
                    </div>)}
                </Card>
                <Card title="Perfil de salud">
                    {healthProfile ? (
                        <dl className="space-y-3">
                            <Field label="Condiciones médicas" value={healthProfile.medicalConditions}/>
                            <Field label="Restricciones dietéticas" value={healthProfile.dietaryRestrictions}/>
                            <Field label="Alergias" value={healthProfile.allergies}/>
                            <Field label="Hipertensión" value={healthProfile.hasHypertension ? 'Sí' : 'No'}/>
                            <Field label="Diabetes" value={healthProfile.hasDiabetes ? 'Sí' : 'No'}/>
                            <Field label="Condiciones especiales" value={healthProfile.specialConditions}/>
                            <Field label="Notas nutricionales" value={healthProfile.nutritionalNotes}/>
                            <Field label="Notas adicionales" value={healthProfile.additionalNotes}/>
                        </dl>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-text-secondary mb-3">Sin perfil de salud registrado.</p>
                            {canManageBeneficiaries &&
                                <Link to={`/beneficiarios/${id}/salud`}><Button variant="secondary" size="sm">Crear
                                    perfil de salud</Button></Link>}
                        </div>
                    )}
                </Card>
            </div>
        </>
    );
}
