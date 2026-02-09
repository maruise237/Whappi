import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const BaseSwal = withReactContent(Swal);

// Configuration de base conforme au DESIGN_SYSTEM.md
export const MySwal = BaseSwal.mixin({
  customClass: {
    container: 'backdrop-blur-sm bg-background/30',
    popup: 'rounded-[2rem] border-2 border-primary/10 bg-background shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] p-6 sm:p-10 max-w-[95vw] sm:max-w-lg !font-sans overflow-hidden',
    title: 'text-foreground font-black text-2xl sm:text-3xl mb-4 tracking-tight uppercase',
    htmlContainer: 'text-muted-foreground text-sm sm:text-base leading-relaxed font-medium',
    confirmButton: 'bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-2xl transition-all font-black uppercase tracking-widest text-xs active:scale-95 w-full sm:w-auto shadow-xl shadow-primary/20 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    cancelButton: 'bg-muted text-muted-foreground hover:bg-muted/80 px-8 py-4 rounded-2xl transition-all font-black uppercase tracking-widest text-xs active:scale-95 w-full sm:w-auto ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    denyButton: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 px-8 py-4 rounded-2xl transition-all font-black uppercase tracking-widest text-xs active:scale-95 w-full sm:w-auto shadow-xl shadow-destructive/20 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    input: 'flex h-14 w-full rounded-2xl border-2 border-input bg-background px-4 py-2 text-sm font-black uppercase tracking-widest ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus:border-primary/30 transition-all mt-6 mb-2 shadow-inner',
    inputLabel: 'text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2 block text-left ml-1',
    validationMessage: 'text-[10px] font-black uppercase tracking-widest text-destructive mt-3 bg-destructive/5 p-3 rounded-xl border-2 border-destructive/10 text-center',
    actions: 'flex flex-col sm:flex-row gap-4 justify-end mt-10 w-full sm:w-auto',
    loader: 'text-primary',
  },
  buttonsStyling: false,
});

export const showLoading = (title: string = 'Chargement...') => {
  return MySwal.fire({
    title,
    allowOutsideClick: false,
    didOpen: () => {
      MySwal.showLoading();
    },
  });
};

export const showAlert = (title: string, text: string, icon: 'success' | 'error' | 'warning' | 'info' | 'question' = 'info') => {
  return MySwal.fire({
    title,
    text,
    icon,
  });
};

export const showConfirm = (title: string, text: string, icon: 'warning' | 'error' | 'success' | 'info' | 'question' = 'warning') => {
  return MySwal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText: 'Confirmer',
    cancelButtonText: 'Annuler',
  });
};

export default MySwal;
