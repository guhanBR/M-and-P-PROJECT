/* ================================================
   SHARED DATA STORE — Spare Parts Ordering System
   localStorage-based for frontend MVP
   Ready for Java Spring Boot + MySQL integration
   ================================================ */

var MotoStore = (function () {
  var KEYS = { products: 'mp_products', categories: 'mp_categories', cart: 'mp_cart', orders: 'mp_orders' };

  /* ===================== SEED DATA ===================== */

  var SEED_CATEGORIES = [
    { id: 1, name: 'Bearings', color: '#1565C0', icon: 'fas fa-circle', desc: 'Ball bearings, roller bearings, thrust bearings for pump and motor applications', products: 5, status: 'active', dateCreated: '2026-01-05' },
    { id: 2, name: 'Capacitors', color: '#DC2626', icon: 'fas fa-bolt', desc: 'Start and run capacitors for single-phase motors and pumps', products: 5, status: 'active', dateCreated: '2026-01-05' },
    { id: 3, name: 'Cooling Fans', color: '#0D9488', icon: 'fas fa-fan', desc: 'Axial fans, centrifugal blowers, and fan covers for motor cooling', products: 5, status: 'active', dateCreated: '2026-01-08' },
    { id: 4, name: 'Mechanical Seals', color: '#7C3AED', icon: 'fas fa-cog', desc: 'Single seals, double seals, cartridge seals for pump shafts', products: 5, status: 'active', dateCreated: '2026-01-10' },
    { id: 5, name: 'Pump Impellers', color: '#0D9488', icon: 'fas fa-compact-disc', desc: 'Open, closed, and semi-open impellers for centrifugal pumps', products: 5, status: 'active', dateCreated: '2026-01-12' },
    { id: 6, name: 'Pump Shafts', color: '#F59E0B', icon: 'fas fa-minus-circle', desc: 'Precision ground stainless steel and carbon steel pump shafts', products: 5, status: 'active', dateCreated: '2026-01-15' },
    { id: 7, name: 'Couplings', color: '#7C3AED', icon: 'fas fa-link', desc: 'Flexible jaw, gear, and disc couplings for motor-pump connections', products: 5, status: 'active', dateCreated: '2026-01-18' },
    { id: 8, name: 'Oil Seals', color: '#F59E0B', icon: 'fas fa-shield-alt', desc: 'NBR, Viton, and FKM oil seals for bearing and shaft protection', products: 5, status: 'active', dateCreated: '2026-01-20' },
    { id: 9, name: 'Gaskets', color: '#16A34A', icon: 'fas fa-layer-group', desc: 'Fiber gaskets, O-rings, spiral wound gaskets for pump casings', products: 5, status: 'active', dateCreated: '2026-01-22' },
    { id: 10, name: 'Accessories', color: '#64748B', icon: 'fas fa-box', desc: 'V-belts, terminal boxes, overload relays, conduit connectors', products: 5, status: 'active', dateCreated: '2026-01-25' }
  ];

  var SEED_PRODUCTS = [
    { id: 1, name: 'Deep Groove Ball Bearing 6205', category: 'Bearings', part: 'BRG-6205-2RS', brand: 'SKF', model: 'Siemens 1LE1, ABB M3AA', capacity: '25x52x15mm', price: 850, warranty: '12 months', stock: 45, status: 'active', unit: 'Piece', dateAdded: '2026-01-15', lastUpdated: '2026-06-20', image: 'https://placehold.co/80x80/1565C0/fff?text=BRG', desc: 'Sealed deep groove ball bearing for pump and motor applications' },
    { id: 2, name: 'Angular Contact Bearing 7310', category: 'Bearings', part: 'BRG-7310-BECBM', brand: 'SKF', model: 'KSB Etanorm, Grundfos CR', capacity: '50x110x27mm', price: 1420, warranty: '12 months', stock: 18, status: 'active', unit: 'Piece', dateAdded: '2026-01-20', lastUpdated: '2026-05-10', image: 'https://placehold.co/80x80/1565C0/fff?text=BRG', desc: 'Angular contact ball bearing for high axial loads' },
    { id: 3, name: 'Ball Bearing 6308 ZZ', category: 'Bearings', part: 'BRG-6308-ZZ', brand: 'SKF', model: 'ABB M3AA, WEG W22', capacity: '40x90x23mm', price: 1100, warranty: '12 months', stock: 30, status: 'active', unit: 'Piece', dateAdded: '2026-02-05', lastUpdated: '2026-07-01', image: 'https://placehold.co/80x80/1565C0/fff?text=BRG', desc: 'Shielded ball bearing for general motor use' },
    { id: 4, name: 'Cylindrical Roller Bearing NU206', category: 'Bearings', part: 'BRG-NU206-ECM', brand: 'SKF', model: 'Siemens 1LE1, WEG W22', capacity: '30x62x16mm', price: 980, warranty: '12 months', stock: 22, status: 'active', unit: 'Piece', dateAdded: '2026-02-10', lastUpdated: '2026-06-15', image: 'https://placehold.co/80x80/1565C0/fff?text=BRG', desc: 'High-speed cylindrical roller bearing' },
    { id: 5, name: 'Thrust Ball Bearing 51205', category: 'Bearings', part: 'BRG-51205', brand: 'SKF', model: 'Grundfos NK, KSB Z', capacity: '25x47x15mm', price: 620, warranty: '6 months', stock: 35, status: 'active', unit: 'Piece', dateAdded: '2026-03-01', lastUpdated: '2026-07-05', image: 'https://placehold.co/80x80/1565C0/fff?text=BRG', desc: 'Thrust ball bearing for axial load support' },
    { id: 6, name: 'Start Capacitor 100\u03BCF 450V', category: 'Capacitors', part: 'CAP-START-100', brand: 'ABB', model: 'Siemens 1LE1, ABB M3AA', capacity: '100\u03BCF / 450V AC', price: 450, warranty: '6 months', stock: 60, status: 'active', unit: 'Piece', dateAdded: '2026-01-10', lastUpdated: '2026-06-25', image: 'https://placehold.co/80x80/DC2626/fff?text=CAP', desc: 'Heavy-duty motor start capacitor for single-phase motors' },
    { id: 7, name: 'Run Capacitor 30\u03BCF 440V', category: 'Capacitors', part: 'CAP-RUN-30', brand: 'ABB', model: 'WEG W22, Siemens 1LE1', capacity: '30\u03BCF / 440V AC', price: 320, warranty: '6 months', stock: 75, status: 'active', unit: 'Piece', dateAdded: '2026-01-18', lastUpdated: '2026-05-20', image: 'https://placehold.co/80x80/DC2626/fff?text=CAP', desc: 'Oil-filled motor run capacitor for continuous duty' },
    { id: 8, name: 'Start Capacitor 150\u03BCF 450V', category: 'Capacitors', part: 'CAP-START-150', brand: 'ABB', model: 'ABB M3AA, WEG W22', capacity: '150\u03BCF / 450V AC', price: 680, warranty: '6 months', stock: 40, status: 'active', unit: 'Piece', dateAdded: '2026-02-20', lastUpdated: '2026-06-30', image: 'https://placehold.co/80x80/DC2626/fff?text=CAP', desc: 'High-capacity start capacitor for heavy-duty motors' },
    { id: 9, name: 'Run Capacitor 50\u03BCF 440V', category: 'Capacitors', part: 'CAP-RUN-50', brand: 'ABB', model: 'Siemens 1LE1, Grundfos', capacity: '50\u03BCF / 440V AC', price: 420, warranty: '6 months', stock: 55, status: 'active', unit: 'Piece', dateAdded: '2026-03-05', lastUpdated: '2026-07-08', image: 'https://placehold.co/80x80/DC2626/fff?text=CAP', desc: 'Premium run capacitor for pump motors' },
    { id: 10, name: 'Dual Capacitor CBB65 45\u03BCF', category: 'Capacitors', part: 'CAP-DUAL-45', brand: 'ABB', model: 'WEG W22, ABB M3AA', capacity: '45\u03BCF / 450V AC', price: 550, warranty: '6 months', stock: 35, status: 'active', unit: 'Piece', dateAdded: '2026-03-15', lastUpdated: '2026-07-12', image: 'https://placehold.co/80x80/DC2626/fff?text=CAP', desc: 'Dual-purpose start/run capacitor combo' },
    { id: 11, name: 'Axial Fan Blade 300mm', category: 'Cooling Fans', part: 'FAN-AX-300', brand: 'Siemens', model: 'Siemens 1LE1, ABB M3AA', capacity: '300mm / 4-blade', price: 680, warranty: '6 months', stock: 30, status: 'active', unit: 'Piece', dateAdded: '2026-01-25', lastUpdated: '2026-06-10', image: 'https://placehold.co/80x80/0D9488/fff?text=FAN', desc: 'Metal axial fan blade for motor cooling' },
    { id: 12, name: 'Cooling Fan Blade 250mm', category: 'Cooling Fans', part: 'FAN-COOL-250', brand: 'ABB', model: 'ABB M3AA, WEG W22', capacity: '250mm / 5-blade', price: 520, warranty: '6 months', stock: 40, status: 'active', unit: 'Piece', dateAdded: '2026-02-08', lastUpdated: '2026-06-18', image: 'https://placehold.co/80x80/0D9488/fff?text=FAN', desc: 'Plastic cooling fan for TEFC motors' },
    { id: 13, name: 'Motor Cooling Fan 200mm', category: 'Cooling Fans', part: 'FAN-MOT-200', brand: 'Siemens', model: 'Siemens 1LE1, Grundfos', capacity: '200mm / 6-blade', price: 450, warranty: '6 months', stock: 50, status: 'active', unit: 'Piece', dateAdded: '2026-02-25', lastUpdated: '2026-07-02', image: 'https://placehold.co/80x80/0D9488/fff?text=FAN', desc: 'High-efficiency cooling fan for small motors' },
    { id: 14, name: 'Centrifugal Fan Wheel 350mm', category: 'Cooling Fans', part: 'FAN-CENT-350', brand: 'Siemens', model: 'KSB Etanorm, Siemens 1LE1', capacity: '350mm / 12-vane', price: 920, warranty: '12 months', stock: 15, status: 'active', unit: 'Piece', dateAdded: '2026-03-10', lastUpdated: '2026-07-10', image: 'https://placehold.co/80x80/0D9488/fff?text=FAN', desc: 'Centrifugal blower wheel for industrial fans' },
    { id: 15, name: 'IP55 Fan Cover Assembly', category: 'Cooling Fans', part: 'FAN-CVR-IP55', brand: 'ABB', model: 'ABB M3AA, WEG W22', capacity: '300mm cover set', price: 380, warranty: '6 months', stock: 25, status: 'active', unit: 'Set', dateAdded: '2026-03-20', lastUpdated: '2026-07-15', image: 'https://placehold.co/80x80/0D9488/fff?text=FAN', desc: 'Fan cover assembly with guard for IP55 motors' },
    { id: 16, name: 'Mechanical Seal 50mm Type 2800', category: 'Mechanical Seals', part: 'MS-50-CR', brand: 'John Crane', model: 'Grundfos CR, KSB Etanorm', capacity: '50mm shaft', price: 2800, warranty: '12 months', stock: 5, status: 'active', unit: 'Piece', dateAdded: '2026-01-12', lastUpdated: '2026-06-05', image: 'https://placehold.co/80x80/7C3AED/fff?text=MS', desc: 'Type 2800 single seal, carbide/silicon carbide faces' },
    { id: 17, name: 'Mechanical Seal 65mm Eagleburg', category: 'Mechanical Seals', part: 'MS-65-EG', brand: 'John Crane', model: 'KSB Etanorm, Grundfos NK', capacity: '65mm shaft', price: 3200, warranty: '12 months', stock: 12, status: 'active', unit: 'Piece', dateAdded: '2026-01-28', lastUpdated: '2026-06-22', image: 'https://placehold.co/80x80/7C3AED/fff?text=MS', desc: 'Eagleburg elastomer bellows seal for clean liquids' },
    { id: 18, name: 'Cartridge Seal CS-40', category: 'Mechanical Seals', part: 'MS-CS40-JC', brand: 'John Crane', model: 'Grundfos CR, WEG pump', capacity: '40mm shaft', price: 5200, warranty: '24 months', stock: 2, status: 'active', unit: 'Piece', dateAdded: '2026-02-15', lastUpdated: '2026-07-01', image: 'https://placehold.co/80x80/7C3AED/fff?text=MS', desc: 'Complete cartridge mechanical seal assembly' },
    { id: 19, name: 'Mechanical Seal 35mm B7T', category: 'Mechanical Seals', part: 'MS-35-B7T', brand: 'John Crane', model: 'Grundfos NB, KSB MegaCPA', capacity: '35mm shaft', price: 1950, warranty: '12 months', stock: 8, status: 'active', unit: 'Piece', dateAdded: '2026-03-02', lastUpdated: '2026-07-08', image: 'https://placehold.co/80x80/7C3AED/fff?text=MS', desc: 'B7T single seal for clean water applications' },
    { id: 20, name: 'Double Seal Plan 53A 50mm', category: 'Mechanical Seals', part: 'MS-50-DS', brand: 'John Crane', model: 'Siemens 1LE1 pump, KSB', capacity: '50mm shaft', price: 8500, warranty: '24 months', stock: 3, status: 'active', unit: 'Piece', dateAdded: '2026-03-18', lastUpdated: '2026-07-12', image: 'https://placehold.co/80x80/7C3AED/fff?text=MS', desc: 'Dual pressurized seal system for hazardous fluids' },
    { id: 21, name: 'Impeller X200 Centrifugal SS316', category: 'Pump Impellers', part: 'IMP-X200-SS', brand: 'Grundfos', model: 'Grundfos CR 15-5, KSB Etanorm', capacity: '200mm / 15m\u00B3/h', price: 4500, warranty: '12 months', stock: 3, status: 'active', unit: 'Piece', dateAdded: '2026-01-08', lastUpdated: '2026-06-28', image: 'https://placehold.co/80x80/0D9488/fff?text=IMP', desc: 'Open type centrifugal impeller, SS316 stainless steel' },
    { id: 22, name: 'Impeller M150 Closed Cast Iron', category: 'Pump Impellers', part: 'IMP-M150-CS', brand: 'KSB', model: 'KSB Etanorm 50-210', capacity: '150mm / 10m\u00B3/h', price: 3800, warranty: '12 months', stock: 7, status: 'active', unit: 'Piece', dateAdded: '2026-01-30', lastUpdated: '2026-06-15', image: 'https://placehold.co/80x80/0D9488/fff?text=IMP', desc: 'Closed type impeller, cast iron construction' },
    { id: 23, name: 'Impeller V180 Bronze', category: 'Pump Impellers', part: 'IMP-V180-BZ', brand: 'Grundfos', model: 'Grundfos NB 80-160', capacity: '180mm / 12m\u00B3/h', price: 5200, warranty: '12 months', stock: 4, status: 'active', unit: 'Piece', dateAdded: '2026-02-18', lastUpdated: '2026-07-05', image: 'https://placehold.co/80x80/0D9488/fff?text=IMP', desc: 'Bronze impeller for seawater and brackish water' },
    { id: 24, name: 'Submersible Impeller 100mm', category: 'Pump Impellers', part: 'IMP-SUB-100', brand: 'Grundfos', model: 'Grundfos SE1, KSB Amarex', capacity: '100mm / 8m\u00B3/h', price: 2800, warranty: '12 months', stock: 6, status: 'active', unit: 'Piece', dateAdded: '2026-03-08', lastUpdated: '2026-07-10', image: 'https://placehold.co/80x80/0D9488/fff?text=IMP', desc: 'Open impeller for submersible sewage pumps' },
    { id: 25, name: 'Impeller P250 High Head', category: 'Pump Impellers', part: 'IMP-P250-HH', brand: 'KSB', model: 'KSB Etanorm 80-250', capacity: '250mm / 25m\u00B3/h', price: 6800, warranty: '12 months', stock: 2, status: 'active', unit: 'Piece', dateAdded: '2026-03-25', lastUpdated: '2026-07-15', image: 'https://placehold.co/80x80/0D9488/fff?text=IMP', desc: 'High-head closed impeller for industrial pumping' },
    { id: 26, name: 'Pump Shaft A10 SS35mm', category: 'Pump Shafts', part: 'SHA-A10-SS', brand: 'Grundfos', model: 'Grundfos CR 15-5', capacity: '35mm dia / 300mm', price: 3200, warranty: '12 months', stock: 2, status: 'active', unit: 'Piece', dateAdded: '2026-01-22', lastUpdated: '2026-06-12', image: 'https://placehold.co/80x80/F59E0B/fff?text=SHA', desc: 'Precision ground SS316 shaft for centrifugal pumps' },
    { id: 27, name: 'Pump Shaft B20 CS 40mm', category: 'Pump Shafts', part: 'SHA-B20-CS', brand: 'KSB', model: 'KSB Etanorm 50-210', capacity: '40mm dia / 350mm', price: 2800, warranty: '12 months', stock: 9, status: 'active', unit: 'Piece', dateAdded: '2026-02-12', lastUpdated: '2026-06-20', image: 'https://placehold.co/80x80/F59E0B/fff?text=SHA', desc: 'Carbon steel shaft with keyway for pump coupling' },
    { id: 28, name: 'Pump Shaft C30 SS 50mm', category: 'Pump Shafts', part: 'SHA-C30-SS', brand: 'Grundfos', model: 'Grundfos NB 80-160', capacity: '50mm dia / 400mm', price: 4500, warranty: '12 months', stock: 4, status: 'active', unit: 'Piece', dateAdded: '2026-02-28', lastUpdated: '2026-07-02', image: 'https://placehold.co/80x80/F59E0B/fff?text=SHA', desc: 'Heavy-duty SS shaft for high-flow pumps' },
    { id: 29, name: 'Motor Shaft Extension 25mm', category: 'Pump Shafts', part: 'SHA-MSE-25', brand: 'Siemens', model: 'Siemens 1LE1, ABB M3AA', capacity: '25mm dia / 200mm', price: 1800, warranty: '6 months', stock: 12, status: 'active', unit: 'Piece', dateAdded: '2026-03-12', lastUpdated: '2026-07-08', image: 'https://placehold.co/80x80/F59E0B/fff?text=SHA', desc: 'Motor shaft extension piece for coupling mount' },
    { id: 30, name: 'Pump Shaft D40 Hardened 45mm', category: 'Pump Shafts', part: 'SHA-D40-HD', brand: 'KSB', model: 'KSB Etanorm 80-250', capacity: '45mm dia / 450mm', price: 5200, warranty: '12 months', stock: 3, status: 'active', unit: 'Piece', dateAdded: '2026-03-28', lastUpdated: '2026-07-14', image: 'https://placehold.co/80x80/F59E0B/fff?text=SHA', desc: 'Hardened steel shaft for heavy-duty pump service' },
    { id: 31, name: 'Flexible Coupling 28mm Jaw Type', category: 'Couplings', part: 'CPL-FLEX-28', brand: 'Siemens', model: 'Siemens 1LE1, ABB M3AA', capacity: '28mm bore', price: 1200, warranty: '6 months', stock: 22, status: 'active', unit: 'Set', dateAdded: '2026-01-14', lastUpdated: '2026-06-08', image: 'https://placehold.co/80x80/7C3AED/fff?text=CPL', desc: 'Jaw-type flexible coupling with spider insert' },
    { id: 32, name: 'Gear Coupling 35mm Set', category: 'Couplings', part: 'CPL-GEAR-35', brand: 'Eaton', model: 'KSB Etanorm, Grundfos CR', capacity: '35mm bore', price: 2400, warranty: '12 months', stock: 8, status: 'active', unit: 'Set', dateAdded: '2026-02-02', lastUpdated: '2026-06-18', image: 'https://placehold.co/80x80/7C3AED/fff?text=CPL', desc: 'Toothed gear coupling set for high-torque applications' },
    { id: 33, name: 'Coupling Element SPIDER 40', category: 'Couplings', part: 'CPL-SPDR-40', brand: 'Eaton', model: 'ABB M3AA, WEG W22', capacity: '40mm bore', price: 850, warranty: '6 months', stock: 30, status: 'active', unit: 'Piece', dateAdded: '2026-02-22', lastUpdated: '2026-07-01', image: 'https://placehold.co/80x80/7C3AED/fff?text=CPL', desc: 'Replacement spider element for jaw coupling' },
    { id: 34, name: 'Flexible Coupling 50mm Disc Type', category: 'Couplings', part: 'CPL-DISC-50', brand: 'Eaton', model: 'KSB Etanorm 80-250', capacity: '50mm bore', price: 3200, warranty: '12 months', stock: 5, status: 'active', unit: 'Set', dateAdded: '2026-03-15', lastUpdated: '2026-07-10', image: 'https://placehold.co/80x80/7C3AED/fff?text=CPL', desc: 'Disc-type flexible coupling for precision alignment' },
    { id: 35, name: 'Locking Assembly Keyless 38mm', category: 'Couplings', part: 'CPL-LOCK-38', brand: 'Siemens', model: 'Siemens 1LE1, Grundfos', capacity: '38mm bore', price: 1650, warranty: '6 months', stock: 14, status: 'active', unit: 'Piece', dateAdded: '2026-03-22', lastUpdated: '2026-07-15', image: 'https://placehold.co/80x80/7C3AED/fff?text=CPL', desc: 'Keyless locking assembly for secure shaft mounting' },
    { id: 36, name: 'Oil Seal 35x50x8 NBR', category: 'Oil Seals', part: 'OS-35508-NBR', brand: 'Parker', model: 'Grundfos CR, KSB NB', capacity: '35x50x8mm', price: 85, warranty: '3 months', stock: 4, status: 'active', unit: 'Piece', dateAdded: '2026-01-16', lastUpdated: '2026-06-25', image: 'https://placehold.co/80x80/F59E0B/fff?text=OIL', desc: 'NBR single-lip oil seal for general purpose' },
    { id: 37, name: 'Oil Seal 42x60x8 Viton', category: 'Oil Seals', part: 'OS-42608-VIT', brand: 'Parker', model: 'KSB Etanorm, Grundfos NB', capacity: '42x60x8mm', price: 120, warranty: '6 months', stock: 15, status: 'active', unit: 'Piece', dateAdded: '2026-02-06', lastUpdated: '2026-06-30', image: 'https://placehold.co/80x80/F59E0B/fff?text=OIL', desc: 'Viton double-lip oil seal for high temperature' },
    { id: 38, name: 'Oil Seal 50x72x10 NBR', category: 'Oil Seals', part: 'OS-507210-NBR', brand: 'Parker', model: 'Grundfos NB 80-160', capacity: '50x72x10mm', price: 150, warranty: '3 months', stock: 20, status: 'active', unit: 'Piece', dateAdded: '2026-02-20', lastUpdated: '2026-07-05', image: 'https://placehold.co/80x80/F59E0B/fff?text=OIL', desc: 'Heavy-duty NBR oil seal for large shafts' },
    { id: 39, name: 'Oil Seal 30x42x7 TC Double Lip', category: 'Oil Seals', part: 'OS-30427-TC', brand: 'Parker', model: 'ABB M3AA, WEG W22', capacity: '30x42x7mm', price: 75, warranty: '3 months', stock: 50, status: 'active', unit: 'Piece', dateAdded: '2026-03-05', lastUpdated: '2026-07-08', image: 'https://placehold.co/80x80/F59E0B/fff?text=OIL', desc: 'TC-type double-lip oil seal for motor bearing housing' },
    { id: 40, name: 'Oil Seal 60x80x10 FKM', category: 'Oil Seals', part: 'OS-608010-FKM', brand: 'Parker', model: 'KSB Etanorm 80-250', capacity: '60x80x10mm', price: 220, warranty: '6 months', stock: 10, status: 'active', unit: 'Piece', dateAdded: '2026-03-20', lastUpdated: '2026-07-12', image: 'https://placehold.co/80x80/F59E0B/fff?text=OIL', desc: 'FKM fluoroelastomer oil seal for chemical resistance' },
    { id: 41, name: 'Gasket Set Premium Fiber', category: 'Gaskets', part: 'GSK-PREM-SET', brand: 'Eaton', model: 'Grundfos CR, KSB Etanorm', capacity: 'Full pump set', price: 350, warranty: '3 months', stock: 50, status: 'active', unit: 'Set', dateAdded: '2026-01-20', lastUpdated: '2026-06-15', image: 'https://placehold.co/80x80/16A34A/fff?text=GSK', desc: 'Complete fiber gasket set for pump casing and covers' },
    { id: 42, name: 'O-Ring Kit 100pc NBR', category: 'Gaskets', part: 'GSK-ORING-100', brand: 'Parker', model: 'Universal fit', capacity: '100 pieces', price: 480, warranty: '6 months', stock: 35, status: 'active', unit: 'Set', dateAdded: '2026-02-10', lastUpdated: '2026-06-28', image: 'https://placehold.co/80x80/16A34A/fff?text=GSK', desc: 'NBR O-ring assortment kit, 10-50mm sizes' },
    { id: 43, name: 'Pump Casing Gasket Graphite', category: 'Gaskets', part: 'GSK-CASE-150', brand: 'Grundfos', model: 'Grundfos CR 15-5', capacity: '150mm ID', price: 180, warranty: '3 months', stock: 60, status: 'active', unit: 'Piece', dateAdded: '2026-02-25', lastUpdated: '2026-07-01', image: 'https://placehold.co/80x80/16A34A/fff?text=GSK', desc: 'Graphite-faced pump casing gasket for high pressure' },
    { id: 44, name: 'Flange Gasket Spiral Wound 80mm', category: 'Gaskets', part: 'GSK-FLG-80', brand: 'Eaton', model: 'KSB Etanorm 50-210', capacity: '80mm ID / 150mm OD', price: 280, warranty: '6 months', stock: 40, status: 'active', unit: 'Piece', dateAdded: '2026-03-10', lastUpdated: '2026-07-08', image: 'https://placehold.co/80x80/16A34A/fff?text=GSK', desc: 'Spiral wound gasket with inner ring for flange joints' },
    { id: 45, name: 'Motor Terminal Gasket EPDM', category: 'Gaskets', part: 'GSK-TERM-EP', brand: 'Parker', model: 'Siemens 1LE1, ABB M3AA', capacity: 'Universal', price: 65, warranty: '3 months', stock: 80, status: 'active', unit: 'Piece', dateAdded: '2026-03-25', lastUpdated: '2026-07-14', image: 'https://placehold.co/80x80/16A34A/fff?text=GSK', desc: 'EPDM gasket for motor terminal box sealing' },
    { id: 46, name: 'Thermal Overload Relay 1-1.6A', category: 'Accessories', part: 'ACC-THERM-OL', brand: 'ABB', model: 'ABB M3AA100, Siemens 1LE1', capacity: '1-1.6A range', price: 780, warranty: '12 months', stock: 25, status: 'active', unit: 'Piece', dateAdded: '2026-01-24', lastUpdated: '2026-06-20', image: 'https://placehold.co/80x80/64748B/fff?text=ACC', desc: 'Motor protection thermal overload relay' },
    { id: 47, name: 'Motor Terminal Box IP55 Cast', category: 'Accessories', part: 'ACC-TERM-BOX', brand: 'Siemens', model: 'Siemens 1LE1, WEG W22', capacity: 'IP55 rated', price: 280, warranty: '6 months', stock: 40, status: 'active', unit: 'Piece', dateAdded: '2026-02-14', lastUpdated: '2026-06-25', image: 'https://placehold.co/80x80/64748B/fff?text=ACC', desc: 'IP55 cast aluminum terminal box for motor connection' },
    { id: 48, name: 'V-Belt SPA-1120', category: 'Accessories', part: 'ACC-BELT-SPA', brand: 'Eaton', model: 'Grundfos pump drives', capacity: 'SPA section / 1120mm', price: 250, warranty: '3 months', stock: 0, status: 'active', unit: 'Piece', dateAdded: '2026-03-01', lastUpdated: '2026-07-05', image: 'https://placehold.co/80x80/64748B/fff?text=ACC', desc: 'SPA section V-belt for pump drive systems' },
    { id: 49, name: 'Motor Fan Cover 160 Frame', category: 'Accessories', part: 'ACC-FANCVR-160', brand: 'ABB', model: 'ABB M3AA160, WEG W22', capacity: 'IEC 160 frame', price: 350, warranty: '6 months', stock: 18, status: 'active', unit: 'Piece', dateAdded: '2026-03-12', lastUpdated: '2026-07-10', image: 'https://placehold.co/80x80/64748B/fff?text=ACC', desc: 'Replacement fan cover for IEC 160 frame motors' },
    { id: 50, name: 'Conduit Box Connector M25', category: 'Accessories', part: 'ACC-COND-M25', brand: 'Siemens', model: 'Siemens 1LE1, ABB M3AA', capacity: 'M25 thread', price: 45, warranty: '3 months', stock: 100, status: 'active', unit: 'Piece', dateAdded: '2026-03-18', lastUpdated: '2026-07-15', image: 'https://placehold.co/80x80/64748B/fff?text=ACC', desc: 'M25 cable gland connector for motor conduit box' }
  ];

  /* ===================== LOCALStorage HELPERS ===================== */

  function get(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; }
  }

  function set(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  function init() {
    if (!get(KEYS.products) || get(KEYS.products).length === 0) {
      set(KEYS.products, SEED_PRODUCTS);
    }
    if (!get(KEYS.categories) || get(KEYS.categories).length === 0) {
      set(KEYS.categories, SEED_CATEGORIES);
    }
    if (!get(KEYS.cart)) { set(KEYS.cart, []); }
    if (!get(KEYS.orders)) { set(KEYS.orders, []); }
  }

  /* ===================== PRODUCTS ===================== */

  function getProducts() { return get(KEYS.products) || []; }

  function getActiveProducts() {
    return getProducts().filter(function (p) { return p.status === 'active'; });
  }

  function getProductById(id) {
    var list = getProducts();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function saveProducts(list) { set(KEYS.products, list); }

  function addProduct(p) {
    var list = getProducts();
    var maxId = 0;
    for (var i = 0; i < list.length; i++) { if (list[i].id > maxId) maxId = list[i].id; }
    p.id = maxId + 1;
    p.dateAdded = new Date().toISOString().slice(0, 10);
    p.lastUpdated = p.dateAdded;
    list.push(p);
    saveProducts(list);
    return p;
  }

  function updateProduct(id, data) {
    var list = getProducts();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) {
        for (var k in data) { if (data.hasOwnProperty(k)) list[i][k] = data[k]; }
        list[i].lastUpdated = new Date().toISOString().slice(0, 10);
        saveProducts(list);
        return list[i];
      }
    }
    return null;
  }

  function deleteProduct(id) {
    var list = getProducts().filter(function (p) { return p.id !== id; });
    saveProducts(list);
  }

  function updateStock(id, qty) {
    var list = getProducts();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) {
        list[i].stock = qty;
        list[i].lastUpdated = new Date().toISOString().slice(0, 10);
        saveProducts(list);
        return list[i];
      }
    }
    return null;
  }

  /* ===================== CATEGORIES ===================== */

  function getCategories() { return get(KEYS.categories) || []; }

  function getCategoryByName(name) {
    var list = getCategories();
    for (var i = 0; i < list.length; i++) {
      if (list[i].name === name) return list[i];
    }
    return null;
  }

  function saveCategories(list) { set(KEYS.categories, list); }

  function addCategory(c) {
    var list = getCategories();
    var maxId = 0;
    for (var i = 0; i < list.length; i++) { if (list[i].id > maxId) maxId = list[i].id; }
    c.id = maxId + 1;
    c.dateCreated = new Date().toISOString().slice(0, 10);
    c.products = 0;
    c.status = 'active';
    list.push(c);
    saveCategories(list);
    return c;
  }

  function updateCategory(id, data) {
    var list = getCategories();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) {
        for (var k in data) { if (data.hasOwnProperty(k)) list[i][k] = data[k]; }
        saveCategories(list);
        return list[i];
      }
    }
    return null;
  }

  function deleteCategory(id) {
    var list = getCategories().filter(function (c) { return c.id !== id; });
    saveCategories(list);
  }

  function countProductsByCategory(catName) {
    return getProducts().filter(function (p) { return p.category === catName; }).length;
  }

  function refreshCategoryCounts() {
    var cats = getCategories();
    for (var i = 0; i < cats.length; i++) {
      cats[i].products = countProductsByCategory(cats[i].name);
    }
    saveCategories(cats);
  }

  /* ===================== CART ===================== */

  function getCart() { return get(KEYS.cart) || []; }

  function saveCart(cart) { set(KEYS.cart, cart); }

  function addToCart(productId, qty) {
    qty = qty || 1;
    var cart = getCart();
    var found = false;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].productId === productId) {
        cart[i].qty += qty;
        found = true;
        break;
      }
    }
    if (!found) { cart.push({ productId: productId, qty: qty }); }
    saveCart(cart);
    return cart;
  }

  function updateCartItem(productId, qty) {
    var cart = getCart();
    if (qty <= 0) {
      cart = cart.filter(function (item) { return item.productId !== productId; });
    } else {
      for (var i = 0; i < cart.length; i++) {
        if (cart[i].productId === productId) { cart[i].qty = qty; break; }
      }
    }
    saveCart(cart);
    return cart;
  }

  function removeFromCart(productId) {
    var cart = getCart().filter(function (item) { return item.productId !== productId; });
    saveCart(cart);
    return cart;
  }

  function clearCart() { saveCart([]); }

  function getCartCount() {
    var cart = getCart();
    var count = 0;
    for (var i = 0; i < cart.length; i++) { count += cart[i].qty; }
    return count;
  }

  function getCartTotal() {
    var cart = getCart();
    var products = getProducts();
    var total = 0;
    for (var i = 0; i < cart.length; i++) {
      for (var j = 0; j < products.length; j++) {
        if (products[j].id === cart[i].productId) {
          total += products[j].price * cart[i].qty;
          break;
        }
      }
    }
    return total;
  }

  /* ===================== ORDERS ===================== */

  function getOrders() { return get(KEYS.orders) || []; }

  function getOrdersByStatus(status) {
    return getOrders().filter(function (o) { return o.status === status; });
  }

  function getOrderById(id) {
    var list = getOrders();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function saveOrders(list) { set(KEYS.orders, list); }

  function placeOrder(customerData) {
    var cart = getCart();
    if (cart.length === 0) return null;

    var products = getProducts();
    var items = [];
    var total = 0;

    for (var i = 0; i < cart.length; i++) {
      for (var j = 0; j < products.length; j++) {
        if (products[j].id === cart[i].productId) {
          var subtotal = products[j].price * cart[i].qty;
          items.push({
            productId: products[j].id,
            name: products[j].name,
            part: products[j].part,
            price: products[j].price,
            qty: cart[i].qty,
            subtotal: subtotal
          });
          total += subtotal;
          /* Decrement stock */
          products[j].stock = Math.max(0, products[j].stock - cart[i].qty);
          break;
        }
      }
    }

    saveProducts(products);

    var orders = getOrders();
    var maxId = 0;
    for (var k = 0; k < orders.length; k++) { if (orders[k].id > maxId) maxId = orders[k].id; }

    var order = {
      id: maxId + 1,
      customer: customerData.name,
      phone: customerData.phone,
      email: customerData.email,
      address: customerData.address,
      payment: 'cod',
      items: items,
      total: total,
      status: 'pending',
      tracking: '',
      date: new Date().toISOString().slice(0, 10)
    };

    orders.unshift(order);
    saveOrders(orders);
    clearCart();
    return order;
  }

  function updateOrderStatus(id, status, tracking) {
    var orders = getOrders();
    for (var i = 0; i < orders.length; i++) {
      if (orders[i].id === id) {
        orders[i].status = status;
        if (tracking !== undefined) orders[i].tracking = tracking;
        saveOrders(orders);
        return orders[i];
      }
    }
    return null;
  }

  function getOrdersByEmail(email) {
    return getOrders().filter(function (o) { return o.email === email; });
  }

  /* ===================== BRANDS ===================== */

  function getBrands() {
    var brands = [];
    var seen = {};
    var products = getProducts();
    for (var i = 0; i < products.length; i++) {
      if (!seen[products[i].brand]) {
        brands.push(products[i].brand);
        seen[products[i].brand] = true;
      }
    }
    return brands.sort();
  }

  /* ===================== COLOR MAPS ===================== */

  var colorMap = {
    'Bearings': '#1565C0', 'Mechanical Seals': '#7C3AED', 'Pump Impellers': '#0D9488',
    'Pump Shafts': '#F59E0B', 'Capacitors': '#DC2626', 'Couplings': '#7C3AED',
    'Cooling Fans': '#0D9488', 'Oil Seals': '#F59E0B', 'Gaskets': '#16A34A', 'Accessories': '#64748B'
  };

  var brandColors = {
    'SKF': '#0066B3', 'John Crane': '#E31937', 'Grundfos': '#003F72', 'KSB': '#00529B',
    'ABB': '#FF000F', 'Siemens': '#009999', 'Eaton': '#00529B', 'Parker': '#D12020',
    'WEG': '#0066B3', 'Garrett': '#333333'
  };

  function getColor(cat) { return colorMap[cat] || '#64748B'; }
  function getBrandColor(brand) { return brandColors[brand] || '#64748B'; }

  /* ===================== FORMAT HELPERS ===================== */

  function formatINR(amount) {
    return '\u20B9' + parseFloat(amount).toLocaleString('en-IN');
  }

  function formatDate(d) {
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var dt = new Date(d);
    return months[dt.getMonth()] + ' ' + dt.getDate() + ', ' + dt.getFullYear();
  }

  /* ===================== PUBLIC API ===================== */

  init();
  refreshCategoryCounts();

  return {
    KEYS: KEYS,
    getProducts: getProducts,
    getActiveProducts: getActiveProducts,
    getProductById: getProductById,
    saveProducts: saveProducts,
    addProduct: addProduct,
    updateProduct: updateProduct,
    deleteProduct: deleteProduct,
    updateStock: updateStock,
    getCategories: getCategories,
    getCategoryByName: getCategoryByName,
    saveCategories: saveCategories,
    addCategory: addCategory,
    updateCategory: updateCategory,
    deleteCategory: deleteCategory,
    countProductsByCategory: countProductsByCategory,
    refreshCategoryCounts: refreshCategoryCounts,
    getCart: getCart,
    addToCart: addToCart,
    updateCartItem: updateCartItem,
    removeFromCart: removeFromCart,
    clearCart: clearCart,
    getCartCount: getCartCount,
    getCartTotal: getCartTotal,
    getOrders: getOrders,
    getOrderById: getOrderById,
    getOrdersByStatus: getOrdersByStatus,
    getOrdersByEmail: getOrdersByEmail,
    placeOrder: placeOrder,
    updateOrderStatus: updateOrderStatus,
    getBrands: getBrands,
    getColor: getColor,
    getBrandColor: getBrandColor,
    formatINR: formatINR,
    formatDate: formatDate,
    colorMap: colorMap,
    brandColors: brandColors
  };

})();

/* ===================== NAV CART BADGE UPDATE ===================== */
function updateNavCartBadge() {
  var badges = document.querySelectorAll('.cart-badge');
  var count = MotoStore.getCartCount();
  for (var i = 0; i < badges.length; i++) {
    badges[i].textContent = count;
    badges[i].style.display = count > 0 ? 'inline-flex' : 'none';
  }
}

document.addEventListener('DOMContentLoaded', updateNavCartBadge);
