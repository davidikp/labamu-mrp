import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Bell,
  Box,
  BrandLogoIcon,
  BrandLogoLockup,
  Building2,
  Calendar,
  CalendarIcon,
  Check,
  CheckIcon,
  ChevronDown,
  ChevronDownIcon,
  ChevronLeft,
  ChevronLeftIcon,
  ChevronRight,
  ChevronRightIcon,
  CloudUploadIcon,
  CreditCard,
  DashboardIcon,
  DeleteIcon,
  Download,
  DownloadIcon,
  EditIcon,
  File,
  FileIcon,
  FileImage,
  FileText,
  FinancingIcon,
  GridViewIcon,
  HelpCircle,
  ImageAssetIcon,
  Info,
  LayoutGrid,
  List,
  ListViewIcon,
  ManufacturingIcon,
  Minus,
  MoreVertical,
  MoreVerticalIcon,
  NotificationIcon,
  Pencil,
  Pickaxe,
  Plus,
  ProductIcon,
  ResourcesIcon,
  RoleIcon,
  RoutingIcon,
  SalesIcon,
  Search,
  SearchIcon,
  Settings,
  TeamIcon,
  Trash2,
  Upload,
  UploadIcon,
  User,
  UserGuideIcon,
  UserIcon,
  Users,
  WorkOrderIcon,
  Wrench,
  X,
  AddIcon,
  AnalyticsIcon,
  BillOfMaterialsIcon,
  DocumentIcon,
  CloseIcon,
} from "../../../components/icons/Icons.jsx";
import {
  ALLOWED_DOCUMENT_EXTENSIONS,
  ALLOWED_IMAGE_EXTENSIONS,
  COUNTRY_CODE_OPTIONS,
  DATE_PICKER_MONTHS,
  DATE_PICKER_POPOVER_WIDTH,
  DATE_PICKER_WEEKDAYS,
  FILE_DESCRIPTION_MAX_LENGTH,
  LANGUAGE_OPTIONS,
  MAX_PROOF_UPLOAD_FILES,
  UPLOAD_MAX_FILE_SIZE_BYTES,
} from "../../../constants/appConstants.js";
import {
  DEFAULT_NOTIFICATION_CENTER_PREFERENCES,
  DEFAULT_NOTIFICATION_SETTINGS,
  cloneNotificationSettings,
} from "../../../data/notification/notificationDefaults.js";
import {
  NOTIFICATION_CATEGORY_OPTIONS,
  NOTIFICATION_DELIVERY_OPTIONS,
} from "../../../data/notification/notificationOptions.js";
import { DEFAULT_SYSTEM_NOTIFICATIONS } from "../../../data/notification/systemNotifications.js";
import { MOCK_COMPANY } from "../../../data/company.js";
import { MOCK_VENDORS } from "../../../data/vendors.js";
import {
  MOCK_ADMIN_GROUPS,
  MOCK_ADMIN_ROLES,
  MOCK_ADMIN_USERS,
} from "../../../modules/administration/mock/adminUsers.js";
import {
  MOCK_MATERIAL_LINES,
  MOCK_WO_LINES,
  MOCK_WO_TABLE_DATA,
} from "../../../modules/work-order/mock/workOrderMocks.js";
import {
  MOCK_ACTIVITIES,
  MOCK_PO_DOCUMENTS,
  MOCK_PO_TABLE_DATA,
} from "../../../modules/purchase-order/mock/purchaseOrderMocks.js";
import { MOCK_MATERIALS_DATA } from "../../../modules/materials/mock/materialsMocks.js";
import { MOCK_STOCK_BATCHES } from "../../../modules/materials/mock/batchesMocks.js";
import { MOCK_STOCK_TRANSACTIONS } from "../../../modules/materials/mock/transactionsMocks.js";
import { PurchaseOrderListPage } from "../../../modules/purchase-order/pages/PurchaseOrderListPage.jsx";
import { PurchaseOrderSettingsPage } from "../../../modules/purchase-order/pages/PurchaseOrderSettingsPage.jsx";
import {
  baseInputBorderColor,
  blurInputFrame,
  fieldStyle,
  focusInputFrame,
  inputControlStyle,
  inputFrameStyle,
} from "../../../modules/purchase-order/styles/purchaseOrderInputStyles.js";
import { DocumentTypeBadge } from "../../../modules/purchase-order/components/DocumentTypeBadge.jsx";
import {
  buildPoLinkSnapshot,
  buildReceiptActivityLogs,
  buildReceiptStateFromLines,
  ensureCompletedLogIsLatest,
  formatActivityTimestamp,
} from "../../../modules/purchase-order/utils/purchaseOrderDetailUtils.js";
import { buildPurchaseOrderPdfExportData, exportPurchaseOrderPdf } from "../../../modules/purchase-order/utils/purchaseOrderPdfExport.js";
import {
  formatCurrency,
  formatNumberWithCommas,
  parseNumberFromCommas,
} from "../../../utils/format/formatUtils.js";
import {
  buildCalendarDays,
  formatIsoDateString,
  padDateUnit,
  parseIsoDateString,
} from "../../../utils/date/dateUtils.js";
import {
  createImageUploadRecord,
  createSyntheticInputEvent,
  createUploadDocumentRecord,
  formatUploadFileSize,
  getDocumentPrimaryLabel,
  getDocumentSecondaryLabel,
  getFileExtension,
  getImageUploadName,
  getImageUploadPreviewUrl,
  getUploadDocumentKind,
  normalizeProofDocuments,
  validateUploadFile,
} from "../../../utils/upload/uploadUtils.js";
import { getEnabledNotificationRuleIds } from "../../../utils/notification/notificationUtils.js";
import {
  applyDomLocalization,
  getTranslation,
  LOCALIZABLE_ATTRIBUTES,
} from "../../../utils/localization/localizationUtils.js";
import { Button } from "../../../components/common/Button.jsx";
import { Checkbox } from "../../../components/common/Checkbox.jsx";
import { DropdownSelect } from "../../../components/common/DropdownSelect.jsx";
import { FilterPill } from "../../../components/common/FilterPill.jsx";
import { IconButton } from "../../../components/common/IconButton.jsx";
import { ListStatusCounterCard } from "../../../components/common/ListStatusCounterCard.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { ToggleSwitch } from "../../../components/common/ToggleSwitch.jsx";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { Sidebar } from "../../../components/layout/Sidebar.jsx";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";

const Tooltip = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left + rect.width / 2,
      });
    }
  };

  useEffect(() => {
    if (isVisible) {
      updateCoords();
      // Use capture phase to catch scrolls in sub-containers (like the table scroller)
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
    }
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isVisible]);

  return (
    <div
      ref={triggerRef}
      style={{
        position: "relative",
        display: "block",
        width: "100%",
        minWidth: 0,
      }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: coords.top - 8,
              left: coords.left,
              transform: "translate(-50%, -100%)",
              width: "max-content",
              maxWidth: "400px",
              zIndex: 10001,
              whiteSpace: "normal",
              padding: "8px 12px",
              borderRadius: "8px",
              background: "var(--neutral-on-surface-primary)",
              color: "var(--neutral-surface-primary)",
              fontSize: "var(--text-desc)",
              lineHeight: "1.6",
              boxShadow: "var(--elevation-sm)",
              zIndex: 10000,
              textAlign: "left",
              pointerEvents: "none",
            }}
          >
            {content}
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                borderWidth: "6px",
                borderStyle: "solid",
                borderColor:
                  "var(--neutral-on-surface-primary) transparent transparent transparent",
              }}
            />
          </div>,
          document.body
        )}
    </div>
  );
};

const LabelValue = ({ label, value, badge }) => {
  const displayValue =
    typeof value === "object" && value !== null ? JSON.stringify(value) : value;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <span
        style={{
          fontSize: "var(--text-body)",
          color: "var(--neutral-on-surface-secondary)",
        }}
      >
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {badge ? (
          <StatusBadge variant={badge.variant}>{badge.text}</StatusBadge>
        ) : (
          <span
            style={{
              fontSize: "var(--text-title-3)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--neutral-on-surface-primary)",
            }}
          >
            {displayValue}
          </span>
        )}
      </div>
    </div>
  );
};

const FormField = ({
  label,
  required = false,
  children,
  error,
  helperText,
  headerRight,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      width: "100%",
    }}
  >
    {label ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: headerRight ? "space-between" : "flex-start",
            gap: "12px",
            fontSize: headerRight ? "var(--text-desc)" : "var(--text-body)",
            fontWeight: "var(--font-weight-regular)",
          }}
        >
        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          {required ? (
            <span style={{ color: "var(--status-red-primary)" }}>*</span>
          ) : null}
          <span style={{ color: "var(--neutral-on-surface-primary)" }}>
            {label}
          </span>
        </div>
        {headerRight ? (
          <span
            style={{
              fontSize: "var(--text-desc)",
              color: "var(--neutral-on-surface-tertiary)",
            }}
          >
            {headerRight}
          </span>
        ) : null}
      </div>
    ) : null}
    {children}
    {error ? (
      <span
        style={{
          fontSize: "var(--text-body)",
          color: "var(--status-red-primary)",
        }}
      >
        {error}
      </span>
    ) : null}
    {!error && helperText ? (
      <span
        style={{
          fontSize: "var(--text-desc)",
          color: "var(--neutral-on-surface-secondary)",
        }}
      >
        {helperText}
      </span>
    ) : null}
  </div>
);

const UnifiedInputShell = ({
  children,
  disabled = false,
  hasError = false,
  style = {},
  onFocus,
  onBlur,
}) => (
  <div
    style={{
      minHeight: "46px",
      height: "auto",
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      border: `1px solid ${hasError
          ? "var(--status-red-primary)"
          : disabled
            ? "var(--neutral-line-outline)"
            : baseInputBorderColor
        }`,
      borderRadius: "10px",
      background: disabled
        ? "var(--neutral-surface-grey-lighter)"
        : "var(--neutral-surface-primary)",
      padding: "0 16px",
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      boxSizing: "border-box",
      overflow: "visible",
      ...style,
    }}
    onFocus={onFocus}
    onBlur={onBlur}
  >
    {children}
  </div>
);

const PhoneInputField = ({
  label,
  required = false,
  value = "",
  onChange,
  disabled,
  error,
  helperText,
}) => {
  const normalizePhoneValue = (input) => {
    if (!input) return { countryCode: "+62", number: "" };
    const matched = COUNTRY_CODE_OPTIONS.find(
      (opt) => input.startsWith(`${opt.code} `) || input === opt.code
    );
    if (matched) {
      const nextNumber = input
        .replace(`${matched.code} `, "")
        .replace(matched.code, "")
        .trim();
      return { countryCode: matched.code, number: nextNumber };
    }
    return { countryCode: "+62", number: input.trim() };
  };

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0, width: 300, placement: "bottom" });
  const parsedValue = normalizePhoneValue(value);
  const selectedOption =
    COUNTRY_CODE_OPTIONS.find((opt) => opt.code === parsedValue.countryCode) ||
    COUNTRY_CODE_OPTIONS[0];
  const filteredOptions = COUNTRY_CODE_OPTIONS.filter((opt) => {
    const q = search.toLowerCase();
    return (
      opt.code.toLowerCase().includes(q) || opt.label.toLowerCase().includes(q)
    );
  });

  const emitChange = (nextCountryCode, nextNumber) => {
    const composed = nextNumber?.trim()
      ? `${nextCountryCode} ${nextNumber.trim()}`
      : nextCountryCode;
    onChange?.(composed);
  };

  const updatePopoverPosition = (el) => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const estimatedHeight = 400;
    const padding = 12;
    const openAbove = 
      window.innerHeight - rect.bottom < estimatedHeight + 16 &&
      rect.top > estimatedHeight + 16;
    
    setPopoverPos({
      top: openAbove ? rect.top - estimatedHeight - padding : rect.bottom + padding,
      left: Math.min(rect.left, window.innerWidth - 316),
      width: Math.min(300, window.innerWidth - 32),
      placement: openAbove ? "top" : "bottom",
    });
  };

  return (
    <FormField
      label={label}
      required={required}
      error={error}
      helperText={helperText}
    >
      <UnifiedInputShell
        disabled={disabled}
        hasError={!!error}
        style={{ position: "relative", zIndex: isOpen ? 200 : "auto" }}
        onFocus={(e) => focusInputFrame(e.currentTarget)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            blurInputFrame(e.currentTarget, !!disabled, !!error);
          }
        }}
      >
        <div style={{ position: "relative", flexShrink: 0 }}>
          <button
            type="button"
            disabled={disabled}
            onClick={(e) => {
              if (disabled) return;
              const nextOpen = !isOpen;
              if (nextOpen) updatePopoverPosition(e.currentTarget);
              setIsOpen(nextOpen);
            }}
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: disabled ? "not-allowed" : "pointer",
              color: disabled
                ? "var(--neutral-on-surface-tertiary)"
                : "var(--neutral-on-surface-primary)",
              fontSize: "var(--text-subtitle-1)",
              fontFamily: "Lato, sans-serif",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: "18px", lineHeight: 1 }}>
              {selectedOption.flag}
            </span>
            <span style={{ whiteSpace: "nowrap" }}>{selectedOption.code}</span>
            <ChevronDownIcon
              size={18}
              color="var(--neutral-on-surface-secondary)"
              style={{
                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            />
          </button>

          {isOpen && !disabled ? (
            <>
              <div
                style={{ position: "fixed", inset: 0, zIndex: 9998 }}
                onClick={() => {
                  setIsOpen(false);
                  setSearch("");
                }}
              />
              <div
                style={{
                  position: "fixed",
                  top: `${popoverPos.top}px`,
                  left: `${popoverPos.left}px`,
                  width: `${popoverPos.width}px`,
                  maxHeight: "400px",
                  display: "flex",
                  flexDirection: "column",
                  background: "var(--neutral-surface-primary)",
                  border: `1px solid ${baseInputBorderColor}`,
                  borderRadius: "16px",
                  boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.12)",
                  zIndex: 9999,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "16px 20px",
                    borderBottom: `1px solid ${baseInputBorderColor}`,
                  }}
                >
                  <TableSearchField
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search country or code..."
                    width="100%"
                    minWidth="0"
                    fontSize="14px"
                  />
                </div>
                <div style={{ maxHeight: "320px", overflowY: "auto" }}>
                  {filteredOptions.map((opt, index) => (
                    <div
                      key={opt.code}
                      onClick={() => {
                        emitChange(opt.code, parsedValue.number);
                        setIsOpen(false);
                        setSearch("");
                      }}
                      onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "var(--neutral-surface-grey-lighter)")
                      }
                      onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        "var(--neutral-surface-primary)")
                      }
                      style={{
                        borderTop:
                          index === 0
                            ? "none"
                            : `1px solid ${baseInputBorderColor}`,
                        padding: "12px 20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ fontSize: "20px", lineHeight: 1 }}>
                        {opt.flag}
                      </span>
                      <span
                        style={{
                          fontSize: "14px",
                          color: "var(--neutral-on-surface-primary)",
                          minWidth: "44px",
                        }}
                      >
                        {opt.code}
                      </span>
                      <span
                        style={{
                          fontSize: "14px",
                          color: "var(--neutral-on-surface-secondary)",
                        }}
                      >
                        {opt.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
        <input
          type="text"
          placeholder="Input phone number"
          value={parsedValue.number}
          onChange={(e) => emitChange(selectedOption.code, e.target.value)}
          disabled={disabled}
          style={{
            flex: 1,
            height: "100%",
            minWidth: 0,
            border: "none",
            outline: "none",
            padding: 0,
            background: "transparent",
            fontSize: "var(--text-subtitle-1)",
            color: disabled
              ? "var(--neutral-on-surface-tertiary)"
              : parsedValue.number
                ? "var(--neutral-on-surface-primary)"
                : "var(--neutral-on-surface-tertiary)",
            fontFamily: "Lato, sans-serif",
          }}
        />
      </UnifiedInputShell>
    </FormField>
  );
};

const DateInputControl = ({
  value = "",
  onChange,
  disabled = false,
  hasError = false,
  placeholder = "yyyy-mm-dd",
  fieldHeight = "48px",
  borderRadius = "10px",
  fontSize = "var(--text-subtitle-1)",
  style = {},
}) => {
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const todayIso = formatIsoDateString(new Date());
  const selectedDate = parseIsoDateString(value);
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(
    selectedDate || parseIsoDateString(todayIso) || new Date()
  );
  const [popoverPos, setPopoverPos] = useState({
    top: 0,
    left: 0,
    width: 360,
    placement: "bottom",
  });
  const [selectionMode, setSelectionMode] = useState("days"); // "days", "months", "years"

  const updatePopoverPosition = () => {
    if (!triggerRef.current || typeof window === "undefined") return;
    const rect = triggerRef.current.getBoundingClientRect();
    const width = Math.max(
      360,
      Math.min(DATE_PICKER_POPOVER_WIDTH, window.innerWidth - 16)
    );
    const estimatedHeight = 360;
    const openAbove =
      window.innerHeight - rect.bottom < estimatedHeight + 16 &&
      rect.top > estimatedHeight + 16;
    const maxLeft = Math.max(8, window.innerWidth - width - 8);
    const leftAlign = rect.left;
    const left = Math.min(Math.max(8, leftAlign), maxLeft);
    setPopoverPos({
      left,
      top: openAbove ? rect.top - 8 : rect.bottom + 8,
      width,
      placement: openAbove ? "top" : "bottom",
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    updatePopoverPosition();

    const handlePointerDown = (event) => {
      if (
        triggerRef.current?.contains(event.target) ||
        popoverRef.current?.contains(event.target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    const handleViewportChange = () => updatePopoverPosition();

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [isOpen]);

  const calendarDays = buildCalendarDays(viewDate);
  const monthLabel = DATE_PICKER_MONTHS[viewDate.getMonth()];
  const yearLabel = viewDate.getFullYear();

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setViewDate(selectedDate || new Date());
          setIsOpen((prev) => !prev);
        }}
        style={{
          width: "100%",
          height: fieldHeight,
          border: `1px solid ${
            hasError
              ? "var(--status-red-primary)"
              : isOpen
                ? "var(--feature-brand-primary)"
                : disabled
                  ? "var(--neutral-line-outline)"
                  : baseInputBorderColor
          }`,
          borderRadius,
          background: disabled
            ? "var(--neutral-surface-grey-lighter)"
            : "var(--neutral-surface-primary)",
          boxShadow: isOpen ? "0 0 0 3px rgba(0, 104, 255, 0.08)" : "none",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          cursor: disabled ? "not-allowed" : "pointer",
          textAlign: "left",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          ...style,
        }}
      >
        <span
          style={{
            fontSize,
            color: disabled
              ? "var(--neutral-on-surface-tertiary)"
              : value
                ? "var(--neutral-on-surface-primary)"
                : "var(--neutral-on-surface-tertiary)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {value || placeholder}
        </span>
        <CalendarIcon
          size={18}
          color={
            disabled
              ? "var(--neutral-line-outline)"
              : "var(--neutral-on-surface-secondary)"
          }
        />
      </button>

      {isOpen ? (
        <div
          ref={popoverRef}
          style={{
            position: "fixed",
            top: `${popoverPos.top}px`,
            left: `${popoverPos.left}px`,
            width: `${popoverPos.width}px`,
            transform:
              popoverPos.placement === "top" ? "translateY(-100%)" : "none",
            background: "var(--neutral-surface-primary)",
            border: "1px solid var(--neutral-line-separator-2)",
            borderRadius: "12px",
            boxShadow: "0px 6px 15px -2px rgba(16, 24, 40, 0.08)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            zIndex: 10020,
          }}
        >
          {selectionMode === "days" ? (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  margin: "4px 8px 8px",
                  border: "1px solid var(--neutral-line-separator-1)",
                  borderRadius: "12px",
                  background: "var(--neutral-surface-primary)",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setViewDate(
                      new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)
                    )
                  }
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <ChevronLeftIcon size={18} color="var(--neutral-on-surface-secondary)" />
                </button>
                <div style={{ display: "flex", gap: "48px", alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={() => setSelectionMode("months")}
                    style={{
                      border: "none",
                      background: "transparent",
                      fontSize: "var(--text-title-2)",
                      fontWeight: "var(--font-weight-bold)",
                      color: "var(--neutral-on-surface-primary)",
                      cursor: "pointer",
                      padding: "4px 8px",
                      borderRadius: "4px"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    {monthLabel.substring(0, 3).toUpperCase()}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectionMode("years")}
                    style={{
                      border: "none",
                      background: "transparent",
                      fontSize: "var(--text-title-2)",
                      fontWeight: "var(--font-weight-bold)",
                      color: "var(--neutral-on-surface-primary)",
                      cursor: "pointer",
                      padding: "4px 8px",
                      borderRadius: "4px"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    {yearLabel}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setViewDate(
                      new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)
                    )
                  }
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <ChevronRightIcon
                    size={18}
                    color="var(--neutral-on-surface-secondary)"
                  />
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                  rowGap: "8px",
                  columnGap: "16px",
                  paddingTop: "4px",
                }}
              >
                {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((weekday) => (
                  <div
                    key={weekday}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      padding: "8px 0",
                      fontSize: "var(--text-title-3)",
                      color: "var(--neutral-on-surface-secondary)",
                    }}
                  >
                    {weekday}
                  </div>
                ))}
              </div>

              <div
                style={{
                  height: "1px",
                  background: "var(--neutral-line-separator-1)",
                  width: "100%",
                  margin: "12px 0"
                }}
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                  rowGap: "8px",
                  columnGap: "16px",
                }}
              >
                {calendarDays.map((day) => {
                  const isSelected = day.iso === value;
                  const isToday = day.iso === todayIso;
                  
                  return (
                    <button
                      key={day.iso}
                      type="button"
                      onClick={() => {
                        onChange?.(createSyntheticInputEvent(day.iso));
                        setIsOpen(false);
                      }}
                      style={{
                        width: "34px",
                        height: "34px",
                        margin: "0 auto",
                        border: "none",
                        borderRadius: "999px",
                        background: isSelected
                          ? "var(--feature-brand-primary)"
                          : isToday
                            ? "var(--feature-brand-container)"
                            : "transparent",
                        color: isSelected
                          ? "var(--feature-brand-on-primary)"
                          : isToday
                            ? "var(--feature-brand-primary)"
                            : day.isCurrentMonth
                              ? "var(--neutral-on-surface-primary)"
                              : "var(--neutral-line-separator-2)",
                        fontSize: "var(--text-subtitle-1)",
                        fontWeight: isToday || isSelected ? "var(--font-weight-bold)" : "var(--font-weight-regular)",
                        cursor: "pointer",
                        position: "relative",
                      }}
                    >
                      {day.day}
                      {isToday && !isSelected && (
                        <div 
                          style={{
                            position: "absolute",
                            bottom: "4px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: "4px",
                            height: "4px",
                            borderRadius: "50%",
                            background: "var(--feature-brand-primary)"
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          ) : selectionMode === "months" ? (
            <div style={{ padding: "8px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                {DATE_PICKER_MONTHS.map((m, idx) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setViewDate(new Date(viewDate.getFullYear(), idx, 1));
                      setSelectionMode("days");
                    }}
                    style={{
                      padding: "12px 8px",
                      border: "none",
                      borderRadius: "8px",
                      background: viewDate.getMonth() === idx ? "var(--feature-brand-primary)" : "transparent",
                      color: viewDate.getMonth() === idx ? "var(--feature-brand-on-primary)" : "var(--neutral-on-surface-primary)",
                      fontSize: "var(--text-title-3)",
                      fontWeight: "500",
                      cursor: "pointer"
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: "8px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                {Array.from({ length: 12 }, (_, i) => viewDate.getFullYear() - 5 + i).map(y => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => {
                      setViewDate(new Date(y, viewDate.getMonth(), 1));
                      setSelectionMode("days");
                    }}
                    style={{
                      padding: "12px 8px",
                      border: "none",
                      borderRadius: "8px",
                      background: viewDate.getFullYear() === y ? "var(--feature-brand-primary)" : "transparent",
                      color: viewDate.getFullYear() === y ? "var(--feature-brand-on-primary)" : "var(--neutral-on-surface-primary)",
                      fontSize: "var(--text-title-3)",
                      fontWeight: "500",
                      cursor: "pointer"
                    }}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </>
  );
};

const DateRangeInputControl = ({
  value = { start: "", end: "" },
  onChange,
  disabled = false,
  hasError = false,
  placeholder = "yyyy-mm-dd - yyyy-mm-dd",
  fieldHeight = "48px",
  borderRadius = "10px",
  fontSize = "var(--text-subtitle-1)",
  style = {},
}) => {
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const startObj = value.start ? parseIsoDateString(value.start) : null;
  const [viewDate, setViewDate] = useState(startObj || new Date());
  const [selecting, setSelecting] = useState("start");

  const [popoverPos, setPopoverPos] = useState({
    top: 0, left: 0, width: 660, placement: "bottom",
  });

  const updatePopoverPosition = () => {
    if (!triggerRef.current || typeof window === "undefined") return;
    const rect = triggerRef.current.getBoundingClientRect();
    const width = 660;
    const estimatedHeight = 360;
    const openAbove = window.innerHeight - rect.bottom < estimatedHeight + 16 && rect.top > estimatedHeight + 16;
    const maxLeft = Math.max(8, window.innerWidth - width - 8);
    const centeredLeft = rect.left + rect.width / 2 - width / 2;
    const left = Math.min(Math.max(8, centeredLeft), maxLeft);
    setPopoverPos({
      left,
      top: openAbove ? rect.top - 8 : rect.bottom + 8,
      width,
      placement: openAbove ? "top" : "bottom",
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    updatePopoverPosition();
    const handlePointerDown = (event) => {
      if (triggerRef.current?.contains(event.target) || popoverRef.current?.contains(event.target)) return;
      setIsOpen(false);
    };
    const handleViewportChange = () => updatePopoverPosition();
    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [isOpen]);

  const nextMonthView = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
  const calendars = [
    { date: viewDate, days: buildCalendarDays(viewDate) },
    { date: nextMonthView, days: buildCalendarDays(nextMonthView) }
  ];

  const displayValue = value.start && value.end ? `${value.start} - ${value.end}` : value.start ? `${value.start} - ...` : "";

  const renderMonth = (monthDate, days, isFirst) => {
    const monthLabel = DATE_PICKER_MONTHS[monthDate.getMonth()];
    const yearLabel = monthDate.getFullYear();

    return (
      <div style={{ flex: 1, minWidth: "280px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", padding: "0 4px" }}>
          {isFirst ? (
            <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} style={{ border: "none", background: "transparent", cursor: "pointer", padding: "4px" }}><ChevronLeftIcon size={20} /></button>
          ) : <div style={{ width: 28 }} />}
          <span style={{ fontWeight: "bold", fontSize: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>{monthLabel} {yearLabel}</span>
          {!isFirst ? (
            <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} style={{ border: "none", background: "transparent", cursor: "pointer", padding: "4px" }}><ChevronRightIcon size={20} /></button>
          ) : <div style={{ width: 28 }} />}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0", textAlign: "center", fontSize: "13px", color: "var(--neutral-on-surface-tertiary)", marginBottom: "8px" }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d} style={{ paddingBottom: "8px" }}>{d}</div>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0" }}>
          {days.map(day => {
            const inMonth = day.isCurrentMonth;
            const isStart = inMonth && day.iso === value.start;
            const isEnd = inMonth && day.iso === value.end;
            const inRange = inMonth && value.start && value.end && day.iso > value.start && day.iso < value.end;
            
            let borderRadiusStyle = "0";
            if (isStart && isEnd) borderRadiusStyle = "99px";
            else if (isStart) borderRadiusStyle = "99px 0 0 99px";
            else if (isEnd) borderRadiusStyle = "0 99px 99px 0";
            else if (!inRange) borderRadiusStyle = "99px";

            return (
              <button
                key={day.iso}
                type="button"
                onClick={() => {
                  if (!inMonth) return;
                  if (selecting === "start") {
                    onChange?.({ target: { value: { start: day.iso, end: "" } } });
                    setSelecting("end");
                  } else {
                    const range = day.iso < value.start ? { start: day.iso, end: value.start } : { start: value.start, end: day.iso };
                    onChange?.({ target: { value: range } });
                    setIsOpen(false);
                  }
                }}
                style={{
                  height: "40px",
                  border: "none",
                  borderRadius: borderRadiusStyle,
                  background: (isStart || isEnd) ? "var(--feature-brand-primary)" : inRange ? "var(--feature-brand-container-lighter)" : "transparent",
                  color: (isStart || isEnd) ? "#fff" : inMonth ? (inRange ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-primary)") : "var(--neutral-line-separator-2)",
                  cursor: inMonth ? "pointer" : "default",
                  fontSize: "14px",
                  position: "relative",
                  fontWeight: (isStart || isEnd) ? "bold" : "normal",
                  transition: "background 0.2s"
                }}
              >
                {day.day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setIsOpen((prev) => !prev);
          setSelecting("start");
        }}
        style={{
          width: "100%",
          height: fieldHeight,
          border: `1px solid ${hasError ? "var(--status-red-primary)" : isOpen ? "var(--feature-brand-primary)" : "var(--neutral-line-separator-1)"}`,
          borderRadius,
          background: "var(--neutral-surface-primary)",
          padding: "0 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
          cursor: "pointer", textAlign: "left",
          ...style,
        }}
      >
        <span style={{ fontSize, color: value.start ? "var(--neutral-on-surface-primary)" : "var(--neutral-on-surface-tertiary)" }}>
          {displayValue || placeholder}
        </span>
        <CalendarIcon size={18} color="var(--neutral-on-surface-secondary)" />
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          style={{
            position: "fixed",
            top: `${popoverPos.top}px`,
            left: `${popoverPos.left}px`,
            width: `${popoverPos.width}px`,
            transform: popoverPos.placement === "top" ? "translateY(-100%)" : "none",
            background: "var(--neutral-surface-primary)",
            border: "1px solid var(--neutral-line-separator-1)",
            borderRadius: "16px",
            boxShadow: "var(--elevation-lg)",
            padding: "24px",
            zIndex: 10020,
            display: "flex",
            gap: "24px"
          }}
        >
          {calendars.map((cal, idx) => (
            <React.Fragment key={idx}>
              {renderMonth(cal.date, cal.days, idx === 0)}
              {idx === 0 && <div style={{ width: "1px", background: "var(--neutral-line-separator-2)", margin: "0 8px" }} />}
            </React.Fragment>
          ))}
        </div>
      )}
    </>
  );
};

function isRangePart(s, e) { return s || e; }

const InputField = ({
  label,
  required,
  type = "text",
  placeholder,
  value,
  onChange,
  disabled,
  icon: Icon,
  max,
  multiline = false,
  error,
  helperText,
  headerRight,
  ...rest
}) => (
  <FormField
    label={label}
    required={required}
    error={error}
    helperText={helperText}
    headerRight={headerRight}
  >
    <div style={{ position: "relative", width: "100%" }}>
      {multiline ? (
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          {...rest}
          style={{
            minHeight: "88px",
            padding: "12px 16px",
            width: "100%",
            resize: "vertical",
            border: "1px solid transparent",
            background: disabled
              ? "var(--neutral-surface-grey-lighter)"
              : "var(--neutral-surface-primary)",
            ...inputFrameStyle(disabled, !!error),
            ...inputControlStyle(disabled, !!value),
            cursor: disabled ? "not-allowed" : "text",
          }}
          onFocus={(e) => focusInputFrame(e.currentTarget)}
          onBlur={(e) => blurInputFrame(e.currentTarget, disabled, !!error)}
        />
      ) : type === "date" ? (
        <DateInputControl
          value={value}
          onChange={onChange}
          disabled={disabled}
          hasError={!!error}
          placeholder={placeholder || "yyyy-mm-dd"}
        />
      ) : (
        <input
          type={type === "number" ? "text" : type}
          placeholder={placeholder}
          value={type === "number" ? formatNumberWithCommas(value) : value}
          onChange={(e) => {
            if (type === "number") {
              const raw = parseNumberFromCommas(e.target.value);
              if (raw === "" || !isNaN(raw) || raw === "-") {
                onChange?.({
                  ...e,
                  target: { ...e.target, value: raw },
                });
              }
            } else {
              onChange?.(e);
            }
          }}
          disabled={disabled}
          max={max}
          {...rest}
          style={{
            height: "48px",
            padding: Icon ? "0 40px 0 16px" : "0 16px",
            border: "1px solid transparent",
            background: disabled
              ? "var(--neutral-surface-grey-lighter)"
              : "var(--neutral-surface-primary)",
            ...inputFrameStyle(disabled, !!error),
            ...inputControlStyle(disabled, !!value),
            cursor: disabled ? "not-allowed" : "text",
          }}
          onFocus={(e) => focusInputFrame(e.currentTarget)}
          onBlur={(e) => blurInputFrame(e.currentTarget, disabled, !!error)}
        />
      )}
      {Icon && type !== "date" ? (
        <Icon
          size={20}
          color={
            disabled
              ? "var(--neutral-line-outline)"
              : "var(--neutral-on-surface-tertiary)"
          }
          style={{
            position: "absolute",
            right: "16px",
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
          }}
        />
      ) : null}
    </div>
  </FormField>
);

const openDocumentLink = (doc, fallbackHandler) => {
  if (doc?.previewUrl && typeof window !== "undefined") {
    window.open(doc.previewUrl, "_blank", "noopener,noreferrer");
    return;
  }
  fallbackHandler?.(doc);
};

const UploadDropzone = ({
  multiple = false,
  accept = ".pdf,.jpg,.jpeg,.png,.webp",
  maxFiles = 1,
  maxText,
  allowedText = "Allowed formats (PDF, JPG, JPEG, PNG, WebP)",
  disabled = false,
  error = "",
  onFilesSelected,
}) => {
  const handleIncomingFiles = (fileList) => {
    if (disabled) return;
    const nextFiles = Array.from(fileList || []);
    if (nextFiles.length === 0) return;
    onFilesSelected?.(nextFiles);
  };

  return (
    <label
      onDragOver={(e) => {
        if (disabled) return;
        e.preventDefault();
      }}
      onDrop={(e) => {
        if (disabled) return;
        e.preventDefault();
        handleIncomingFiles(e.dataTransfer?.files);
      }}
      style={{
        width: "100%",
        minHeight: "168px",
        borderRadius: "24px",
        border: `2px dashed ${disabled
            ? "var(--neutral-line-separator-1)"
            : error
              ? "var(--status-red-primary)"
              : "var(--feature-brand-primary)"
          }`,
        background: disabled
          ? "var(--neutral-surface-grey-lighter)"
          : "var(--neutral-surface-primary)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "24px",
        textAlign: "center",
        boxSizing: "border-box",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: 1,
      }}
    >
      <CloudUploadIcon
        size={40}
        color={
          disabled
            ? "var(--neutral-on-surface-tertiary)"
            : error
              ? "var(--status-red-primary)"
              : "var(--feature-brand-primary)"
        }
      />
      <span
        style={{
          fontSize: "var(--text-body)",
          color: "#A9A9A9",
          lineHeight: "18px",
          letterSpacing: "0.0825px",
        }}
      >
        {maxText ||
          (maxFiles === 1 ? "Max 1 file, 25MB each" : "Max 3 files, 25MB each")}
      </span>
      <span
        style={{
          fontSize: "var(--text-body)",
          color: "#A9A9A9",
          lineHeight: "18px",
          letterSpacing: "0.0825px",
        }}
      >
        {allowedText}
      </span>
      <span
        style={{
          fontSize: "var(--text-body)",
          color: disabled
            ? "var(--neutral-on-surface-tertiary)"
            : "var(--neutral-on-surface-primary)",
          lineHeight: "18px",
          letterSpacing: "0.0825px",
        }}
      >
        Drag file or{" "}
        <span
          style={{
            color: disabled
              ? "var(--neutral-on-surface-tertiary)"
              : "var(--feature-brand-primary)",
          }}
        >
          browse file
        </span>
      </span>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        style={{ display: "none" }}
        onChange={(e) => {
          handleIncomingFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </label>
  );
};

const UploadDescriptionCard = ({
  file,
  onRemove,
  onDescriptionChange,
  descriptionRequired = false,
  descriptionError = "",
  hideDescriptionField = false,
}) => (
  <div
    style={{
      border: "1px solid var(--neutral-line-separator-1)",
      borderRadius: "24px",
      padding: "20px 24px",
      display: "flex",
      flexDirection: "column",
      gap: "18px",
      background: "var(--neutral-surface-primary)",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          minWidth: 0,
        }}
      >
        <DocumentTypeBadge fileName={file?.name} type={file?.type} />
        <span
          style={{
            fontSize: "var(--text-title-3)",
            lineHeight: "20px",
            letterSpacing: "0.09625px",
            fontWeight: "var(--font-weight-regular)",
            color: "var(--neutral-on-surface-primary)",
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {file?.name || "-"}
        </span>
      </div>
      {onRemove ? (
        <Button variant="danger" size="small" onClick={onRemove}>
          Remove
        </Button>
      ) : null}
    </div>

    {!hideDescriptionField ? (
      <InputField
        label="File Description"
        required={descriptionRequired}
        value={file?.description || ""}
        onChange={(e) => onDescriptionChange?.(e.target.value)}
        placeholder="Enter File Description"
        maxLength={FILE_DESCRIPTION_MAX_LENGTH}
        headerRight={`${(file?.description || "").length}/${FILE_DESCRIPTION_MAX_LENGTH}`}
        error={descriptionError}
      />
    ) : null}
  </div>
);

const ImageUploadField = ({
  label = "Images",
  images = [],
  maxFiles = 1,
  disabled = false,
  error = "",
  helperText = "",
  onFilesSelected,
  onRemove,
}) => {
  const normalizedImages = images
    .map((image) => createImageUploadRecord(image))
    .filter(Boolean)
    .slice(0, maxFiles);
  const canAddMore = !disabled && normalizedImages.length < maxFiles;

  const handleIncomingFiles = (fileList) => {
    if (disabled) return;
    const nextFiles = Array.from(fileList || []).slice(
      0,
      Math.max(0, maxFiles - normalizedImages.length)
    );
    if (nextFiles.length === 0) return;
    onFilesSelected?.(nextFiles);
  };

  const renderEmptyTile = () => (
    <label
      onDragOver={(e) => {
        if (disabled) return;
        e.preventDefault();
      }}
      onDrop={(e) => {
        if (disabled) return;
        e.preventDefault();
        handleIncomingFiles(e.dataTransfer?.files);
      }}
      style={{
        width: "120px",
        height: "120px",
        borderRadius: "12px",
        border: `1px dashed ${error ? "var(--status-red-primary)" : "#A9A9A9"}`,
        background: "var(--neutral-surface-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "999px",
          background: "var(--neutral-surface-grey-lighter)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AddIcon size={20} color="var(--neutral-on-surface-tertiary)" />
      </div>
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        multiple={maxFiles > 1}
        disabled={disabled}
        style={{ display: "none" }}
        onChange={(e) => {
          handleIncomingFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </label>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <span
        style={{
          fontSize: "var(--text-title-3)",
          color: "var(--neutral-on-surface-secondary)",
        }}
      >
        {label}
      </span>

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        {normalizedImages.map((image, index) => {
          const previewUrl = getImageUploadPreviewUrl(image);
          const imageName = getImageUploadName(image);
          return (
            <div
              key={image.id || `${imageName}-${index}`}
              style={{
                position: "relative",
                width: "120px",
                height: "120px",
                borderRadius: "12px",
                border:
                  index === 0
                    ? "2px solid var(--feature-brand-primary)"
                    : "1px solid var(--neutral-line-separator-2)",
                padding: "4px",
                background: "var(--neutral-surface-primary)",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "12px",
                  background: "var(--neutral-surface-grey-lighter)",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={imageName}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      padding: "0 10px",
                      textAlign: "center",
                      fontSize: "var(--text-body)",
                      color: "var(--neutral-on-surface-secondary)",
                      lineHeight: "18px",
                      wordBreak: "break-word",
                    }}
                  >
                    {imageName || "Image"}
                  </span>
                )}
              </div>
              {!disabled ? (
                <button
                  type="button"
                  onClick={() => onRemove?.(image)}
                  style={{
                    position: "absolute",
                    top: "-10px",
                    right: "-10px",
                    width: "28px",
                    height: "28px",
                    borderRadius: "999px",
                    border: "1px solid var(--status-red-primary)",
                    background: "var(--neutral-surface-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <CloseIcon size={14} color="var(--status-red-primary)" />
                </button>
              ) : null}
            </div>
          );
        })}

        {canAddMore ? renderEmptyTile() : null}
      </div>

      {error ? (
        <span
          style={{
            fontSize: "var(--text-body)",
            color: "var(--status-red-primary)",
          }}
        >
          {error}
        </span>
      ) : null}

      {helperText ? (
        <span
          style={{
            fontSize: "var(--text-body)",
            color: "var(--neutral-on-surface-secondary)",
          }}
        >
          {helperText}
        </span>
      ) : null}
    </div>
  );
};

const ProofDocumentList = ({ documents = [], onDocumentClick }) => {
  const normalizedDocuments = normalizeProofDocuments(documents);

  if (normalizedDocuments.length === 0) {
    return (
      <span
        style={{
          fontSize: "var(--text-title-3)",
          color: "var(--neutral-on-surface-secondary)",
        }}
      >
        -
      </span>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        gap: "8px",
      }}
    >
      {normalizedDocuments.map((doc, index) => (
        <div
          key={doc.id || `${doc.name}-${index}`}
          style={{ display: "flex", alignItems: "center", gap: "12px" }}
        >
          <DocumentTypeBadge
            fileName={doc.name}
            type={doc.type}
            size="compact"
          />
          <button
            type="button"
            onClick={() => openDocumentLink(doc, onDocumentClick)}
            style={{
              minWidth: 0,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              alignItems: "flex-start",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
              overflow: "hidden",
            }}
          >
            <Tooltip content={getDocumentPrimaryLabel(doc)} position="top">
              <span
                style={{
                  fontSize: "var(--text-title-3)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--feature-brand-primary)",
                  lineHeight: "20px",
                  letterSpacing: "0.09625px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  width: "100%",
                  display: "block",
                }}
              >
                {getDocumentPrimaryLabel(doc)}
              </span>
            </Tooltip>
            <Tooltip content={doc.name} position="top">
              <span
                style={{
                  fontSize: "var(--text-body)",
                  color: "var(--feature-brand-primary)",
                  lineHeight: "18px",
                  letterSpacing: "0.0825px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  width: "100%",
                  display: "block",
                }}
              >
                {doc.name}
              </span>
            </Tooltip>
          </button>
        </div>
      ))}
    </div>
  );
};

const InputGroup = ({
  label,
  required = false,
  prefix,
  suffix,
  value,
  onChange,
  placeholder,
  disabled = false,
  type = "text",
  hasError = false,
  error,
  helperText,
  inputStyle = {},
  containerStyle = {},
  prefixStyle = {},
  suffixStyle = {},
  ...rest
}) => {
  return (
    <FormField
      label={label}
      required={required}
      error={error}
      helperText={helperText}
    >
      <UnifiedInputShell
        disabled={disabled}
        hasError={hasError || !!error}
        style={containerStyle}
        onFocus={(e) => focusInputFrame(e.currentTarget)}
        onBlur={(e) =>
          blurInputFrame(e.currentTarget, disabled, hasError || !!error)
        }
      >
        {prefix ? (
          <span
            style={{
              fontSize: "var(--text-subtitle-1)",
              color: disabled
                ? "var(--neutral-on-surface-tertiary)"
                : "var(--neutral-on-surface-secondary)",
              whiteSpace: "nowrap",
              flexShrink: 0,
              ...prefixStyle,
            }}
          >
            {prefix}
          </span>
        ) : null}

        <input
          type={type === "number" ? "text" : type}
          value={type === "number" ? formatNumberWithCommas(value) : value}
          onChange={(e) => {
            if (type === "number") {
              const rawValue = parseNumberFromCommas(e.target.value);
              if (rawValue === "" || !isNaN(rawValue) || rawValue === "-") {
                onChange({ ...e, target: { ...e.target, value: rawValue } });
              }
            } else {
              onChange(e);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          {...rest}
          style={{
            flex: 1,
            height: "100%",
            minWidth: 0,
            border: "none",
            outline: "none",
            background: "transparent",
            padding: 0,
            fontSize: "var(--text-subtitle-1)",
            color: disabled
              ? "var(--neutral-on-surface-tertiary)"
              : value
                ? "var(--neutral-on-surface-primary)"
                : "var(--neutral-on-surface-tertiary)",
            fontFamily: "Lato, sans-serif",
            boxSizing: "border-box",
            ...inputStyle,
          }}
        />

        {suffix ? (
          <span
            style={{
              fontSize: "var(--text-subtitle-1)",
              color: disabled
                ? "var(--neutral-on-surface-tertiary)"
                : "var(--neutral-on-surface-secondary)",
              whiteSpace: "nowrap",
              flexShrink: 0,
              ...suffixStyle,
            }}
          >
            {suffix}
          </span>
        ) : null}
      </UnifiedInputShell>
    </FormField>
  );
};

const SectionCard = ({ title, children, rightAction }) => (
  <div
    style={{
      background: "var(--neutral-surface-primary)",
      borderRadius: "var(--radius-card)",
      border: "1px solid var(--neutral-line-separator-1)",
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      gap: "24px",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div
          style={{
            width: "4px",
            height: "20px",
            background: "var(--feature-brand-primary)",
            borderRadius: "2px",
          }}
        />
        <h2
          style={{
            margin: 0,
            fontSize: "var(--text-title-1)",
            fontWeight: "var(--font-weight-bold)",
            color: "var(--neutral-on-surface-primary)",
          }}
        >
          {title}
        </h2>
      </div>
      {rightAction ? <div>{rightAction}</div> : null}
    </div>
    {children}
  </div>
);

const Card = ({ children, style = {} }) => (
  <div
    style={{
      background: "var(--neutral-surface-primary)",
      borderRadius: "var(--radius-card)",
      border: "1px solid var(--neutral-line-separator-1)",
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      gap: "20px",
      ...style,
    }}
  >
    {children}
  </div>
);

const cellStyle = (overrides) => ({
  minWidth: 0,
  height: "56px",
  padding: "0 12px",
  display: "flex",
  alignItems: "center",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-primary)",
  ...overrides,
});

const systemTableShellStyle = {
  display: "flex",
  flexDirection: "column",
  border: "1px solid var(--neutral-line-separator-1)",
  borderRadius: "12px",
  overflow: "hidden",
  background: "var(--neutral-surface-primary)",
};

const systemTableHeaderCellStyle = (overrides = {}) => ({
  minWidth: 0,
  height: "49px",
  display: "flex",
  alignItems: "center",
  padding: "0 12px",
  fontSize: "var(--text-title-3)",
  fontWeight: "var(--font-weight-bold)",
  color: "var(--neutral-on-surface-primary)",
  boxSizing: "border-box",
  ...overrides,
});

const systemTableCellStyle = (overrides = {}) => ({
  minWidth: 0,
  minHeight: "56px",
  display: "flex",
  alignItems: "center",
  padding: "0 12px",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-primary)",
  boxSizing: "border-box",
  ...overrides,
});

const systemTableEmptyStateStyle = {
  padding: "32px 24px",
  textAlign: "center",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-tertiary)",
};

const poReferenceTableFrameStyle = {
  border: "none",
  borderRadius: "0",
  overflow: "hidden",
  width: "100%",
};

const poReferenceTableScrollerStyle = {
  overflowX: "auto",
  width: "100%",
};

const poReferenceTableInnerStyle = (minWidth = "100%") => ({
  minWidth,
  width: "100%",
  display: "flex",
  flexDirection: "column",
});

const poReferenceTableHeaderRowStyle = (gridTemplateColumns, gap = "0") => ({
  display: "grid",
  gridTemplateColumns,
  gap,
  padding: "0 16px",
  height: "49px",
  alignItems: "center",
  background: "var(--neutral-surface-primary)",
  borderBottom: "1px solid var(--neutral-line-separator-1)",
  fontSize: "var(--text-title-3)",
  fontWeight: "var(--font-weight-bold)",
  color: "var(--neutral-on-surface-primary)",
});

const poReferenceTableRowStyle = (
  gridTemplateColumns,
  isLast = false,
  overrides = {}
) => ({
  display: "grid",
  gridTemplateColumns,
  gap: overrides.gap || "0",
  padding: "0 16px",
  minHeight: "64px",
  alignItems: "center",
  borderBottom: isLast ? "none" : "1px solid var(--neutral-line-separator-1)",
  background: "var(--neutral-surface-primary)",
  ...overrides,
});

const poReferenceTableHeaderCellStyle = (overrides = {}) => ({
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  ...overrides,
});

const poReferenceTableCellStyle = (overrides = {}) => ({
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-primary)",
  ...overrides,
});

const poReferenceTableEmptyStateStyle = {
  padding: "32px",
  textAlign: "center",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-tertiary)",
  background: "var(--neutral-surface-primary)",
};

const tabButtonStyle = (isActive) => ({
  height: "40px",
  padding: "0 18px",
  borderRadius: "100px",
  border: isActive
    ? "1px solid var(--feature-brand-primary)"
    : "1px solid transparent",
  background: isActive
    ? "var(--neutral-surface-primary)"
    : "rgba(255,255,255,0.56)",
  color: isActive
    ? "var(--feature-brand-primary)"
    : "var(--neutral-on-surface-secondary)",
  fontSize: "var(--text-title-3)",
  fontWeight: isActive
    ? "var(--font-weight-bold)"
    : "var(--font-weight-regular)",
  cursor: "pointer",
});


export const PurchaseOrderDetailPage = ({
  onNavigate,
  initialData,
  poApprovalSettings,
  isSidebarCollapsed = false,
}) => {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  };

  const navigateWithReset = (cb, ...args) => {
    scrollToTop();
    cb(...args);
  };
  const pageTopRef = useRef(null);
  const resolvedPoData = useMemo(() => {
    const pNum = typeof initialData === 'string' ? initialData : initialData?.poNumber;
    if (pNum) {
      return MOCK_PO_TABLE_DATA.find(p => p.poNumber === pNum) || initialData;
    }
    return initialData;
  }, [initialData]);

  const poNumber = typeof initialData === 'string' ? initialData : (initialData?.poNumber || "PO-202603-0001");
  const [currentStatus, setCurrentStatus] = useState(
    resolvedPoData?.status || "Draft"
  );
  const [currentBadge, setCurrentBadge] = useState(
    resolvedPoData?.sBadge || "grey-light"
  );
  const formData = resolvedPoData?.formData || null;

  useEffect(() => {
    if (resolvedPoData) {
      setCurrentStatus(resolvedPoData.status || "Draft");
      setCurrentBadge(resolvedPoData.sBadge || "grey-light");
      setReceiptLogs(resolvedPoData.receiptLogs || []);
      setReceiptLines(resolvedPoData.receiptLines || []);
      setDocuments(resolvedPoData.formData?.documents || MOCK_PO_DOCUMENTS);
    }
  }, [resolvedPoData]);
  const hasDraftData = !!formData;
  const currency = hasDraftData ? formData?.currency || "IDR" : "IDR";
  const displayValue = (value, fallback = "-") => {
    if (value === undefined || value === null) return fallback;
    if (typeof value === "string" && value.trim() === "") return fallback;
    return value;
  };
  const createdDate = hasDraftData
    ? displayValue(formData?.poDate)
    : resolvedPoData?.createdDate || "2026-03-20";
  const [showActionToast, setShowActionToast] = useState(false);
  const [actionToastMessage, setActionToastMessage] = useState("");
  const [actionToastVariant, setActionToastVariant] = useState("success");
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [decisionType, setDecisionType] = useState(null);
  const [decisionComment, setDecisionComment] = useState("");
  const [decisionError, setDecisionError] = useState("");
  const [revisionMessage, setRevisionMessage] = useState(
    currentStatus === "Need Revision"
      ? "Please update the delivery timeline and review the requested changes before resubmitting this purchase order."
      : ""
  );
  const [canceledMessage, setCanceledMessage] = useState(
    currentStatus === "Canceled"
      ? "The purchase order has been canceled and will not proceed further."
      : ""
  );
  const [approvalComment, setApprovalComment] = useState("");
  const approvalCommentRequired = !!(
    poApprovalSettings?.isApprovalActive && poApprovalSettings?.requireComment
  );
  const [activeTab, setActiveTab] = useState("details");
  const [showSubmitGuardModal, setShowSubmitGuardModal] = useState(false);
  const [showDetailSubmitConfirmModal, setShowDetailSubmitConfirmModal] =
    useState(false);
  const [documents, setDocuments] = useState(
    resolvedPoData?.formData?.documents || MOCK_PO_DOCUMENTS
  );
  const [openDocumentMenuId, setOpenDocumentMenuId] = useState(null);
  const [showDocumentToast, setShowDocumentToast] = useState(false);
  const [documentToastMessage, setDocumentToastMessage] = useState("");
  const [documentSearch, setDocumentSearch] = useState("");
  const [documentTypeFilters, setDocumentTypeFilters] = useState([]);
  const [documentView, setDocumentView] = useState("list");
  const [showDocumentFilterMenu, setShowDocumentFilterMenu] = useState(false);
  const [documentFilterMenuPosition, setDocumentFilterMenuPosition] = useState({
    top: 0,
    left: 0,
    placement: "bottom",
  });
  const documentFilterTriggerRef = useRef(null);
  const [showUploadDocumentModal, setShowUploadDocumentModal] = useState(false);
  const [documentUploadFileName, setDocumentUploadFileName] = useState("");
  const [documentUploadFileSize, setDocumentUploadFileSize] = useState(0);
  const [documentUploadFileObject, setDocumentUploadFileObject] =
    useState(null);
  const [documentUploadDescription, setDocumentUploadDescription] =
    useState("");
  const [documentUploadDocumentType, setDocumentUploadDocumentType] =
    useState("other");
  const [documentUploadError, setDocumentUploadError] = useState("");
  const [documentMenuPosition, setDocumentMenuPosition] = useState({
    top: 0,
    left: 0,
    placement: "bottom",
  });
  const [showRenameDocumentModal, setShowRenameDocumentModal] = useState(false);
  const [showDeleteDocumentModal, setShowDeleteDocumentModal] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [renameDocumentValue, setRenameDocumentValue] = useState("");
  const [editDocumentDescriptionValue, setEditDocumentDescriptionValue] =
    useState("");
  const [editDocumentTypeValue, setEditDocumentTypeValue] = useState("other");
  const [receiptLogs, setReceiptLogs] = useState(resolvedPoData?.receiptLogs || []);
  const [receiptLines, setReceiptLines] = useState(resolvedPoData?.receiptLines || []);
  const [showConfirmReceiptModal, setShowConfirmReceiptModal] = useState(false);
  const [receiptProofDocuments, setReceiptProofDocuments] = useState([]);
  const [receiptProofUploadError, setReceiptProofUploadError] = useState("");
  const [receiptProofDescriptionErrors, setReceiptProofDescriptionErrors] =
    useState({});
  const [receiptReceivedBy, setReceiptReceivedBy] = useState("Natasha Smith");
  const [receiptNotes, setReceiptNotes] = useState("");
  const [receiptErrors, setReceiptErrors] = useState({});
  const [showAdjustWoModal, setShowAdjustWoModal] = useState(false);
  const [showAutoAdjustWoMessage, setShowAutoAdjustWoMessage] = useState(false);
  const [documentActivityLogs, setDocumentActivityLogs] = useState([]);
  const getDocumentMenuPosition = (
    triggerRect,
    menuHeight = 156,
    menuWidth = 180
  ) => {
    const viewportHeight =
      typeof window !== "undefined" ? window.innerHeight : 0;
    const viewportWidth =
      typeof window !== "undefined" ? window.innerWidth : 0;
    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;
    const shouldOpenAbove =
      spaceBelow < menuHeight + 12 && spaceAbove > spaceBelow;
    const left = Math.max(
      8,
      Math.min(triggerRect.right - menuWidth, viewportWidth - menuWidth - 8)
    );

    return {
      top: shouldOpenAbove ? triggerRect.top - 8 : triggerRect.bottom + 8,
      left,
      placement: shouldOpenAbove ? "top" : "bottom",
    };
  };
  const getCurrentLogTimestamp = () => {
    return formatActivityTimestamp(new Date());
  };

  const openDocumentActionMenu = (event, docId) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setDocumentMenuPosition(getDocumentMenuPosition(rect, 168, 220));
    setOpenDocumentMenuId((prev) => (prev === docId ? null : docId));
  };

  const updateDocumentFilterMenuPosition = () => {
    if (
      typeof window === "undefined" ||
      !documentFilterTriggerRef.current
    ) {
      return;
    }
    const rect = documentFilterTriggerRef.current.getBoundingClientRect();
    const menuWidth = 360;
    const menuHeight = 260;
    const spaceBelow = window.innerHeight - rect.bottom;
    const shouldOpenAbove =
      spaceBelow < menuHeight + 12 && rect.top > menuHeight + 12;
    const left = Math.max(
      8,
      Math.min(rect.left, window.innerWidth - menuWidth - 8)
    );

    setDocumentFilterMenuPosition({
      top: shouldOpenAbove ? rect.top - 8 : rect.bottom + 8,
      left,
      placement: shouldOpenAbove ? "top" : "bottom",
    });
  };

  useEffect(() => {
    if (!showDocumentFilterMenu) return undefined;

    updateDocumentFilterMenuPosition();

    const handleViewportChange = () => updateDocumentFilterMenuPosition();

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [showDocumentFilterMenu]);

  useEffect(() => {
    if (initialData?.showDraftToast) {
      if (pageTopRef.current) {
        pageTopRef.current.scrollIntoView({ behavior: "auto", block: "start" });
      } else if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
      setActionToastMessage("Purchase order successfully saved");
      setShowActionToast(true);
      const timer = setTimeout(() => setShowActionToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [initialData]);

  const vendorInfo = hasDraftData
    ? {
      name: displayValue(formData?.vendorName),
      phone: displayValue(formData?.vendorDetails?.phone),
      email: displayValue(formData?.vendorDetails?.email),
      address: displayValue(formData?.vendorDetails?.address),
    }
    : {
      name: initialData?.vendorName || "PT Mitra Sejahtera",
      phone: "08123456789",
      email: "contact@mitra.com",
      address: "Jl. Sudirman No.1, Jakarta Pusat, 10220",
    };

  const shipToInfo = hasDraftData
    ? {
      name: displayValue(formData?.shipTo?.name),
      phone: displayValue(formData?.shipTo?.phone),
      email: displayValue(formData?.shipTo?.email),
      address: displayValue(formData?.shipTo?.address),
    }
    : {
      name: "Labamu Manufacturing",
      phone: "+62 21 555 1234",
      email: "procurement@labamu.com",
      address:
        "Jl. Industri Utama Kav 9, South Tangerang, Banten, Indonesia 15320",
    };

  const mockLines = useMemo(
    () =>
      hasDraftData
        ? formData?.lines?.length
          ? formData.lines
          : []
        : [
            {
              id: 1,
              type: "wo",
              item: "Wooden Chair Frame",
              code: "WCF-A1",
              desc:
                "Pre-assembled frame part A with kiln-dried hardwood members, concealed fastener points, edge-sanded surfaces, and transit-ready wrapping for warehouse handling and visual inspection prior to dispatch.",
              woRef: "WO-202603-001",
              qty: 100,
              price: 150000,
              image: "",
              outsourceSteps: [1, 2],
            },
            {
              id: 2,
              type: "material",
              item: "Aluminium Sheet 2mm",
              code: "ALU-SH-2MM",
              desc: "High-grade aluminium sheet with 2mm thickness for aerospace applications.",
              woRef: "-",
              qty: 50,
              price: 450000,
              uom: "Sheet",
              image: "https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&q=80&w=300&h=300",
            },
            {
              id: 3,
              type: "manual",
              item: "Varnish 5L",
              code: "VRN-5",
              desc: "Clear gloss varnish for finishing",
              woRef: "-",
              qty: 20,
              price: 250000,
              image: "",
            },
          ],
    [formData?.lines, hasDraftData]
  );

  const subtotal = mockLines.reduce(
    (acc, line) =>
      acc + (parseFloat(line.qty) || 0) * (parseFloat(line.price) || 0),
    0
  );
  const tax = hasDraftData
    ? subtotal * ((parseFloat(formData?.tax) || 0) / 100)
    : subtotal * 0.11;
  const fees = hasDraftData
    ? (formData?.feeLines || []).reduce(
      (acc, fee) => acc + (parseFloat(fee.amount) || 0),
      0
    )
    : 150000;
  const summaryFeeRows = hasDraftData
    ? (formData?.feeLines || []).length > 0
      ? (formData?.feeLines || []).map((fee, index) => ({
          id: fee.id || `summary-fee-${index}`,
          name: displayValue(fee.name, `Fee ${index + 1}`),
          amount: parseFloat(fee.amount) || 0,
        }))
      : [{ id: "summary-fee-default", name: "Fees", amount: fees }]
    : [{ id: "summary-fee-default", name: "Fees", amount: fees }];
  const total = subtotal + tax + fees;
  const detailNotes = hasDraftData
    ? displayValue(formData?.notes)
    : "Please ensure all items are packaged securely to prevent damage during transit. Deliveries are only accepted between 08:00 AM and 04:00 PM on weekdays.";
  const detailTerms = hasDraftData
    ? displayValue(formData?.terms)
    : "Payment within 30 days from invoice date. Vendor must deliver goods according to the agreed schedule and quantity.";
  const currencyLabel = hasDraftData
    ? formData?.currency === "USD"
      ? "USD - US Dollar"
      : formData?.currency === "IDR"
        ? "IDR - Indonesian Rupiah"
        : displayValue(formData?.currency)
    : "IDR - Indonesian Rupiah";
  const expectedDeliveryDate = hasDraftData
    ? displayValue(formData?.deliveryDate)
    : "2026-04-10";
  const isReceiptFullyReceived =
    receiptLines.length > 0 &&
    receiptLines.every((line) => {
      const remainingQty = Math.max(
        (Number(line.orderedQty) || 0) - (Number(line.receivedQty) || 0),
        0
      );
      return remainingQty === 0;
    });
  const canConfirmReceipt =
    currentStatus === "Issued" && !isReceiptFullyReceived;

  const documentUploadCardFile = useMemo(
    () =>
      documentUploadFileObject
        ? {
            name: documentUploadFileName,
            type: getUploadDocumentKind(documentUploadFileName),
            description: documentUploadDescription,
            size: formatUploadFileSize(documentUploadFileSize),
          }
        : null,
    [
      documentUploadDescription,
      documentUploadFileName,
      documentUploadFileObject,
      documentUploadFileSize,
    ]
  );

  const validateDetailRequiredInfo = () => {
    const missing = [];
    if (!(formData?.vendorName || initialData?.vendorName))
      missing.push("Vendor");
    if (!createdDate || createdDate === "-") missing.push("PO Date");
    if (!currencyLabel || currencyLabel === "-") missing.push("Currency");
    if (!mockLines.length) missing.push("Purchase Order Lines");
    return missing;
  };

  const showHeaderEdit =
    currentStatus === "Draft" || currentStatus === "Need Revision";
  const showHeaderExportPdf =
    currentStatus === "Completed" ||
    currentStatus === "Waiting for Approval" ||
    currentStatus === "Issued" ||
    currentStatus === "Canceled";
  const showFooterSubmit =
    currentStatus === "Draft" || currentStatus === "Need Revision";
  const showFooterApprovalActions = currentStatus === "Waiting for Approval";
  const hasReceiptHistory =
    receiptLogs.length > 0 ||
    (!!formData?.receiptLogs && formData.receiptLogs.length > 0);
  const showFooterIssuedCancel =
    currentStatus === "Issued" && !hasReceiptHistory;
  const resolvePoStatusKey = (status) => {
    if (status === "Waiting for Approval") return "ready_to_send";
    if (status === "Issued") return "issued";
    if (status === "Completed") return "completed";
    if (status === "Need Revision") return "need_revision";
    if (status === "Canceled") return "rejected";
    return "draft";
  };
  const buildCurrentPoSnapshot = (overrides = {}) => {
    const snapshotStatus = overrides.status || currentStatus;
    const snapshotStatusKey =
      overrides.statusKey || resolvePoStatusKey(snapshotStatus);
    const snapshotBadge = overrides.sBadge || currentBadge;
    const snapshotReceiptLogs = overrides.receiptLogs || receiptLogs;
    const snapshotDocuments = overrides.documents || documents;
    const snapshotReceiptLines = overrides.receiptLines || receiptLines;
    const receiptLineMap = new Map(
      (snapshotReceiptLines || []).map((line) => [line.id, line])
    );
    const snapshotLines = (mockLines || []).map((line) => {
      const receiptLine = receiptLineMap.get(line.id);
      return {
        ...line,
        receivedQty: receiptLine
          ? Number(receiptLine.receivedQty || 0)
          : Number(line.receivedQty || 0),
      };
    });

    return buildPoLinkSnapshot({
      poNumber,
      vendorName: vendorInfo.name !== "-" ? vendorInfo.name : initialData?.vendorName || "",
      amount: formatCurrency(total, currency),
      createdDate,
      status: snapshotStatus,
      statusKey: snapshotStatusKey,
      sBadge: snapshotBadge,
      formData: {
        ...(formData || {}),
        vendorName: vendorInfo.name !== "-" ? vendorInfo.name : "",
        vendorDetails: {
          phone: vendorInfo.phone !== "-" ? vendorInfo.phone : "",
          email: vendorInfo.email !== "-" ? vendorInfo.email : "",
          address: vendorInfo.address !== "-" ? vendorInfo.address : "",
        },
        poDate: createdDate !== "-" ? createdDate : "",
        deliveryDate: expectedDeliveryDate ?? "",
        currency,
        shipTo: {
          name: shipToInfo.name !== "-" ? shipToInfo.name : "",
          phone: shipToInfo.phone !== "-" ? shipToInfo.phone : "",
          email: shipToInfo.email !== "-" ? shipToInfo.email : "",
          address: shipToInfo.address !== "-" ? shipToInfo.address : "",
        },
        lines: snapshotLines,
        tax: hasDraftData ? formData?.tax || 0 : 11,
        feeLines: hasDraftData ? formData?.feeLines || [] : [],
        notes: detailNotes !== "-" ? detailNotes : "",
        terms: detailTerms !== "-" ? detailTerms : "",
        receiptLogs: snapshotReceiptLogs,
        documents: snapshotDocuments,
      },
    });
  };

  const clearLinkedWorkOrderVendorPo = (sourceData) => {
    if (!sourceData) return sourceData;

    return {
      ...sourceData,
      vendors: (sourceData.vendors || []).map((vendor) =>
        vendor.poNumber === poNumber
          ? {
              ...vendor,
              poNumber: "",
              isPoApproved: false,
              poStatus: "",
              poBadge: "",
              poStatusKey: "",
              poDetailData: null,
              status: "Waiting",
              receivedOutput: 0,
              receivedDate: "",
              receipts: [],
            }
          : vendor
      ),
    };
  };

  const handlePoAction = (message) => {
    setActionToastVariant("success");
    setActionToastMessage(message);
    setShowActionToast(true);
    setTimeout(() => setShowActionToast(false), 4000);
  };

  const handleExportPdf = async () => {
    if (isExportingPdf || typeof window === "undefined") return;

    const approvedByName = approvalEnabled
      ? approverList[0]?.name || "Approver"
      : "System";

    const exportData = buildPurchaseOrderPdfExportData({
      poNumber,
      createdDate,
      expectedDeliveryDate,
      currency,
      currencyLabel,
      createdBy: requestedBy,
      vendorInfo,
      shipToInfo,
      lines: mockLines,
      subtotal,
      taxRate: hasDraftData ? formData?.tax || 0 : 11,
      summaryFeeRows,
      total,
      notes: detailNotes !== "-" ? detailNotes : "",
      terms: detailTerms !== "-" ? detailTerms : "",
      requestedBy,
      approvedBy: approvedByName,
      approvalEnabled,
      currentStatus,
      company: MOCK_COMPANY,
    });

    setIsExportingPdf(true);
    try {
      await exportPurchaseOrderPdf({ data: exportData });
    } catch (error) {
      console.error("Failed to export purchase order PDF", error);
      setActionToastVariant("error");
      setActionToastMessage(
        "Unable to export Purchase Order PDF. Please try again."
      );
      setShowActionToast(true);
      setTimeout(() => setShowActionToast(false), 4000);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDetailSubmitClick = () => {
    const missingFields = validateDetailRequiredInfo();
    if (missingFields.length > 0) {
      setShowSubmitGuardModal(true);
      return;
    }
    setShowDetailSubmitConfirmModal(true);
  };

  const getApprovedVendorReturnState = (vendor) => {
    const assignedQty = Number(vendor?.output || 0);
    const receivedQty = Number(vendor?.receivedOutput || 0);

    return {
      ...vendor,
      isPoApproved: true,
      status:
        assignedQty > 0 && receivedQty >= assignedQty
          ? "Completed"
          : receivedQty > 0
            ? "Partially Received"
            : "In Progress",
    };
  };

  const syncPoToStockBatches = (action, payload = {}) => {
    const vendorName = vendorInfo.name;
    const poDate = createdDate;
    const expectedDate = expectedDeliveryDate;

    mockLines.forEach(line => {
      // Find matching material
      const material = MOCK_MATERIALS_DATA.find(m => m.sku === line.code || m.name === line.item);
      if (!material) return;

      const batchId = `batch-${poNumber}-${line.id}`;
      if (action === 'issue') {
        // Create new batch
        const newBatch = {
          id: batchId,
          materialId: material.id,
          batchNo: `BN-${poNumber.replace('PO-', '')}-${line.id}`,
          initialQty: Number(line.qty) || 0,
          currentQty: 0,
          reservedQty: 0,
          costPerUnit: Number(line.price) || 0,
          purchaseDate: poDate,
          expectedDate: expectedDate,
          receivedDate: "",
          storageLocation: "",
          vendor: vendorName,
          status: "Requested",
          attachments: 0
        };
        const existing = MOCK_STOCK_BATCHES.find(b => b.id === batchId);
        if (!existing) {
          MOCK_STOCK_BATCHES.push(newBatch);
        }
      } else if (action === 'receipt') {
        const batch = MOCK_STOCK_BATCHES.find(b => b.id === batchId);
        if (batch) {
          const receivedNow = payload.receivedNowMap?.[line.id] || 0;
          batch.currentQty += Number(receivedNow);

          // Record transaction
          if (receivedNow > 0) {
            const timestamp = new Date().toISOString();
            const txId = `tx-${Date.now()}-${line.id}`;
            const newTx = {
              id: txId,
              materialId: material.id,
              date: timestamp,
              batchNo: batch.batchNo,
              type: "In",
              quantity: Number(receivedNow),
              unit: material.unit || "pcs",
              workOrder: null,
              product: "-",
              reason: `Received from ${poNumber}`,
              actionBy: receiptReceivedBy || "Admin User"
            };
            MOCK_STOCK_TRANSACTIONS.push(newTx);
          }
        }
      } else if (action === 'complete') {
        const batch = MOCK_STOCK_BATCHES.find(b => b.id === batchId);
        if (batch) {
          batch.status = "Received";
          batch.receivedDate = payload.completedDate || new Date().toISOString().split('T')[0];
        }
      }
    });
  };

  const handleConfirmDetailSubmit = () => {
    const approvalOn = !!poApprovalSettings?.isApprovalActive;
    const nextStatus = approvalOn ? "Waiting for Approval" : "Issued";
    const nextBadge = approvalOn ? "orange" : "blue";
    const nextStatusKey = resolvePoStatusKey(nextStatus);
    const nextPoSnapshot = buildCurrentPoSnapshot({
      status: nextStatus,
      statusKey: nextStatusKey,
      sBadge: nextBadge,
    });

    setCurrentStatus(nextStatus);
    setCurrentBadge(nextBadge);
    
    // Persist to mock data
    const poIndex = MOCK_PO_TABLE_DATA.findIndex(p => p.poNumber === poNumber);
    if (poIndex !== -1) {
      MOCK_PO_TABLE_DATA[poIndex] = {
        ...MOCK_PO_TABLE_DATA[poIndex],
        status: nextStatus,
        statusKey: nextStatusKey,
        sBadge: nextBadge
      };
    }

    if (nextStatus === "Issued") {
      syncPoToStockBatches("issue");
    }
    
    setShowDetailSubmitConfirmModal(false);

    if (
      !approvalOn &&
      initialData?.from === "work_order_detail" &&
      initialData?.returnTo?.data
    ) {
      const updatedReturnData = {
        ...initialData.returnTo.data,
        vendors: (initialData.returnTo.data.vendors || []).map((vendor) =>
          vendor.poNumber === poNumber
            ? {
                ...getApprovedVendorReturnState(vendor),
                poStatus: nextStatus,
                poBadge: nextBadge,
                poStatusKey: nextStatusKey,
                poDetailData: nextPoSnapshot,
              }
            : vendor
        ),
      };

      initialData.returnTo = {
        ...initialData.returnTo,
        data: updatedReturnData,
      };
    }

    handlePoAction(
      approvalOn
        ? "Purchase order successfully submitted"
        : "Purchase order successfully approved"
    );
  };

  const handleEditPo = () => {
    scrollToTop();
    onNavigate("create", {
      source: "edit_purchase_order",
      poNumber,
      status: currentStatus,
      sBadge: currentBadge,
      ...(initialData?.from ? { from: initialData.from } : {}),
      ...(initialData?.returnTo ? { returnTo: initialData.returnTo } : {}),
      ...(initialData?.from === "work_order_detail"
        ? {
          workOrder: {
            wo:
              initialData?.returnTo?.data?.wo ||
              mockLines.find((line) => line.type === "wo")?.woRef ||
              "-",
            product:
              initialData?.returnTo?.data?.product ||
              mockLines.find((line) => line.type === "wo")?.item ||
              "",
            sku:
              initialData?.returnTo?.data?.sku ||
              mockLines.find((line) => line.type === "wo")?.code ||
              "",
            image:
              initialData?.returnTo?.data?.image ||
              mockLines.find((line) => line.type === "wo")?.image ||
              "",
          },
          assignedOutput:
            mockLines.find((line) => line.type === "wo")?.qty || 0,
          outsourceSteps: initialData?.returnTo?.data?.outsourceSteps || [],
        }
        : {}),
      formData: {
        vendorName: vendorInfo.name !== "-" ? vendorInfo.name : "",
        vendorDetails: {
          phone: vendorInfo.phone !== "-" ? vendorInfo.phone : "",
          email: vendorInfo.email !== "-" ? vendorInfo.email : "",
          address: vendorInfo.address !== "-" ? vendorInfo.address : "",
        },
        poDate: createdDate !== "-" ? createdDate : "",
        deliveryDate: expectedDeliveryDate ?? "",
        currency: hasDraftData ? formData?.currency : "IDR",
        shipTo: {
          name: shipToInfo.name !== "-" ? shipToInfo.name : "",
          phone: shipToInfo.phone !== "-" ? shipToInfo.phone : "",
          email: shipToInfo.email !== "-" ? shipToInfo.email : "",
          address: shipToInfo.address !== "-" ? shipToInfo.address : "",
        },
        lines: mockLines,
        tax: hasDraftData ? formData?.tax || 0 : 11,
        feeLines: hasDraftData ? formData?.feeLines || [] : [],
        notes: detailNotes !== "-" ? detailNotes : "",
        terms: detailTerms !== "-" ? detailTerms : "",
      },
    });
  };

  const openDecisionModal = (type) => {
    setDecisionType(type);
    setDecisionComment("");
    setDecisionError("");
    setIsDecisionModalOpen(true);
  };

  const getDecisionMeta = () => {
    if (decisionType === "cancel") {
      return {
        title: "Cancel Purchase Order",
        helper: "Add a reason for canceling this purchase order.",
        mandatory: true,
      };
    }
    if (decisionType === "revision") {
      return {
        title: "Ask for Revision",
        helper: "Add revision notes for the requester.",
        mandatory: true,
      };
    }
    return {
      title: "Approve Purchase Order",
      helper: approvalCommentRequired
        ? "Comment is required before approving this purchase order."
        : "Add a comment for approval if needed.",
      mandatory: approvalCommentRequired,
    };
  };

  const handleSubmitDecision = () => {
    const meta = getDecisionMeta();
    const trimmedComment = decisionComment.trim();
    if (meta.mandatory && !trimmedComment) {
      setDecisionError("Comment is required.");
      return;
    }

    if (decisionType === "cancel") {
      setCurrentStatus("Canceled");
      setCurrentBadge("red");
      setCanceledMessage(trimmedComment);
      setRevisionMessage("");
      setApprovalComment("");

      if (
        currentStatus === "Issued" &&
        !hasReceiptHistory &&
        initialData?.from === "work_order_detail" &&
        initialData?.returnTo?.data
      ) {
        initialData.returnTo = {
          ...initialData.returnTo,
          data: clearLinkedWorkOrderVendorPo(initialData.returnTo.data),
        };
      }

      handlePoAction("Purchase order successfully canceled");
    } else if (decisionType === "revision") {
      setCurrentStatus("Need Revision");
      setCurrentBadge("yellow");
      setRevisionMessage(trimmedComment);
      setCanceledMessage("");
      setApprovalComment("");
      handlePoAction("Purchase order revision successfully requested");
    } else {
      setCurrentStatus("Issued");
      setCurrentBadge("blue");
      syncPoToStockBatches("issue");
      setRevisionMessage("");
      setCanceledMessage("");
      setApprovalComment(trimmedComment);

      if (
        initialData?.from === "work_order_detail" &&
        initialData?.returnTo?.data
      ) {
        const approvedPoSnapshot = buildCurrentPoSnapshot({
          status: "Issued",
          statusKey: resolvePoStatusKey("Issued"),
          sBadge: "blue",
        });
        const updatedReturnData = {
          ...initialData.returnTo.data,
          vendors: (initialData.returnTo.data.vendors || []).map((vendor) =>
            vendor.poNumber === poNumber
              ? {
                  ...getApprovedVendorReturnState(vendor),
                  poStatus: "Issued",
                  poBadge: "blue",
                  poStatusKey: resolvePoStatusKey("Issued"),
                  poDetailData: approvedPoSnapshot,
                }
              : vendor
          ),
        };

        initialData.returnTo = {
          ...initialData.returnTo,
          data: updatedReturnData,
        };
      }

      handlePoAction("Purchase order successfully approved");
    }

    setIsDecisionModalOpen(false);
    setDecisionType(null);
    setDecisionComment("");
    setDecisionError("");
  };

  const handleBackNavigation = () => {
    if (initialData?.from === "work_order_detail" && initialData?.returnTo) {
      const nextStatusKey = resolvePoStatusKey(currentStatus);
      const nextPoSnapshot = buildCurrentPoSnapshot({
        status: currentStatus,
        statusKey: nextStatusKey,
        sBadge: currentBadge,
      });
      const nextReturnData = {
        ...initialData.returnTo.data,
        vendors: (initialData.returnTo.data?.vendors || []).map((vendor) => {
          if (vendor.poNumber !== poNumber) return vendor;
          const isApprovedStatus =
            currentStatus === "Issued" || currentStatus === "Completed";
          return {
            ...vendor,
            ...(isApprovedStatus ? getApprovedVendorReturnState(vendor) : {}),
            isPoApproved: isApprovedStatus,
            poStatus: currentStatus,
            poBadge: currentBadge,
            poStatusKey: nextStatusKey,
            poDetailData: nextPoSnapshot,
          };
        }),
      };
      onNavigate(initialData.returnTo.view || "detail", nextReturnData);
      return;
    }
    if (initialData?.from === "material_detail" && initialData?.returnTo) {
      onNavigate(initialData.returnTo.view, initialData.returnTo.data);
      return;
    }
    onNavigate("list");
  };

  const approvalEnabled = !!poApprovalSettings?.isApprovalActive;
  const approverList = poApprovalSettings?.approvers?.length
    ? poApprovalSettings.approvers
    : [
      {
        id: "default-approver",
        name: "Natasha Smith",
        email: "natasha.smith@company.com",
        position: "Owner",
      },
    ];
  const requestedBy = "Joko";
  const requestedAt = createdDate;

  const getApprovalRowStatus = () => {
    if (currentStatus === "Issued" || currentStatus === "Completed")
      return { text: "Approved", variant: "green-light" };
    if (currentStatus === "Canceled")
      return { text: "Rejected", variant: "red-light" };
    if (currentStatus === "Need Revision")
      return { text: "Ask for Revision", variant: "yellow-light" };
    return { text: "Pending", variant: "grey-light" };
  };

  const getApprovalRowComment = () => {
    if (currentStatus === "Need Revision") return revisionMessage || "-";
    if (currentStatus === "Canceled") return canceledMessage || "-";
    if (currentStatus === "Issued" || currentStatus === "Completed")
      return approvalComment || "-";
    return "-";
  };

  const baseActivityLogs = [
    {
      name: "Joko",
      email: "joko@company.com",
      title: "PO Created",
      desc: "",
      timestamp: `${createdDate} at 14:30`,
    },
  ];

  const statusActivityLogs = (() => {
    if (currentStatus === "Waiting for Approval") {
      return [
        {
          name: "Joko",
          email: "joko@company.com",
          title: "PO Submitted",
          desc: "",
          timestamp: `${createdDate} at 15:15`,
        },
      ];
    }

    if (currentStatus === "Need Revision") {
      return [
        {
          name: approverList[0]?.name || "Approver",
          email: approverList[0]?.email || "-",
          title: "Ask for Revision",
          desc: revisionMessage || "-",
          timestamp: `${createdDate} at 16:30`,
        },
        {
          name: "Joko",
          email: "joko@company.com",
          title: "PO Submitted",
          desc: "",
          timestamp: `${createdDate} at 15:15`,
        },
      ];
    }

    if (currentStatus === "Issued") {
      return [
        {
          name: approvalEnabled
            ? approverList[0]?.name || "Approver"
            : "System",
          email: approvalEnabled ? approverList[0]?.email || "-" : "-",
          title: "PO Approved",
          desc: approvalComment || "",
          timestamp: `${createdDate} at 16:30`,
        },
        ...(approvalEnabled
          ? [
            {
              name: "Joko",
              email: "joko@company.com",
              title: "PO Submitted",
              desc: "",
              timestamp: `${createdDate} at 15:15`,
            },
          ]
          : []),
      ];
    }

    if (currentStatus === "Canceled") {
      return [
        {
          name: approverList[0]?.name || "Approver",
          email: approverList[0]?.email || "-",
          title: "PO Canceled",
          desc: canceledMessage || "-",
          timestamp: `${createdDate} at 16:30`,
        },
        {
          name: "Joko",
          email: "joko@company.com",
          title: "PO Submitted",
          desc: "",
          timestamp: `${createdDate} at 15:15`,
        },
      ];
    }

    if (currentStatus === "Completed") {
      return [
        {
          name: "System",
          email: "-",
          title: "PO Completed",
          desc: "All ordered items have been fully received.",
          timestamp: `${createdDate} at 17:30`,
        },
        {
          name: approvalEnabled
            ? approverList[0]?.name || "Approver"
            : "System",
          email: approvalEnabled ? approverList[0]?.email || "-" : "-",
          title: "PO Approved",
          desc: approvalComment || "",
          timestamp: `${createdDate} at 16:30`,
        },
        ...(approvalEnabled
          ? [
            {
              name: "Joko",
              email: "joko@company.com",
              title: "PO Submitted",
              desc: "",
              timestamp: `${createdDate} at 15:15`,
            },
          ]
          : []),
      ];
    }

    return [];
  })();

  const receiptActivityLogs = buildReceiptActivityLogs(receiptLogs);
  const dynamicActivityLogs = ensureCompletedLogIsLatest(
    [
      ...statusActivityLogs,
      ...receiptActivityLogs,
      ...documentActivityLogs,
      ...baseActivityLogs,
    ],
    currentStatus
  );
  const groupedReceiptLogs = receiptLogs.reduce((acc, log) => {
    const key = log.receiptNumber || log.id;
    const existing = acc.find((entry) => entry.receiptNumber === key);
    const normalizedProofDocuments = normalizeProofDocuments(
      log.proofDocuments || log.attachments,
      log.proof
    );
    if (existing) {
      existing.items = [...(existing.items || []), ...(log.items || [])];
      existing.proofDocuments = [
        ...(existing.proofDocuments || []),
        ...normalizedProofDocuments,
      ].filter(
        (doc, index, docs) =>
          docs.findIndex(
            (candidate) =>
              (candidate.id && doc.id && candidate.id === doc.id) ||
              (candidate.name === doc.name &&
                candidate.description === doc.description &&
                candidate.type === doc.type)
          ) === index
      );
      return acc;
    }

    acc.push({
      ...log,
      receiptNumber: key,
      items: [...(log.items || [])],
      proofDocuments: normalizedProofDocuments,
    });
    return acc;
  }, []);

  const tabButtonStyle = (isActive) => ({
    height: "48px",
    padding: "0 28px",
    borderRadius: "100px",
    border: isActive
      ? "1px solid var(--feature-brand-primary)"
      : "1px solid transparent",
    background: isActive ? "#EAF1FF" : "var(--neutral-surface-primary)",
    color: isActive ? "var(--feature-brand-primary)" : "#7F7F7F",
    fontSize: "var(--text-title-2)",
    fontWeight: isActive
      ? "var(--font-weight-bold)"
      : "var(--font-weight-regular)",
    cursor: "pointer",
    boxShadow: "none",
    transition: "all 0.18s ease",
  });

  const documentTypeFilterOptions = [
    { value: "invoice", label: "Invoice" },
    { value: "delivery_note", label: "Delivery Note" },
    { value: "packing_list", label: "Packing List" },
    { value: "quotation_vendor", label: "Quotation (Vendor)" },
    { value: "contract_agreement", label: "Contract / Agreement" },
    { value: "other", label: "Other" },
  ];

  const getDocumentTypeLabel = (documentType) => {
    if (documentType === "invoice") return "Invoice";
    if (documentType === "delivery_note") return "Delivery Note";
    if (documentType === "quotation_vendor") return "Quotation (Vendor)";
    if (documentType === "contract") return "Contract / Agreement";
    if (documentType === "contract_agreement") return "Contract / Agreement";
    if (documentType === "packing_list") return "Packing List";
    return "Other";
  };

  const getNormalizedDocumentType = (documentType) => {
    if (documentType === "contract") return "contract_agreement";
    return documentTypeFilterOptions.some((opt) => opt.value === documentType)
      ? documentType
      : "other";
  };

  const getDocumentPreview = (doc, compact = false) => {
    const radius = compact ? "12px" : "0px";
    if (doc.type === "image" && doc.previewUrl) {
      return (
        <img
          src={doc.previewUrl}
          alt={doc.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: radius,
            display: "block",
          }}
        />
      );
    }
    if (doc.type === "video" && doc.previewUrl) {
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            borderRadius: radius,
            overflow: "hidden",
            background: "#111",
          }}
        >
          <video
            src={doc.previewUrl}
            muted
            playsInline
            preload="metadata"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.22) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: compact ? "22px" : "54px",
              height: compact ? "22px" : "54px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderTop: compact
                  ? "6px solid transparent"
                  : "10px solid transparent",
                borderBottom: compact
                  ? "6px solid transparent"
                  : "10px solid transparent",
                borderLeft: compact ? "10px solid white" : "16px solid white",
                marginLeft: compact ? "2px" : "4px",
              }}
            />
          </div>
        </div>
      );
    }
    if (doc.type === "image") {
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(180deg, #CFE1FF 0%, #F6E6C9 100%)",
            borderRadius: radius,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 36%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: compact ? "5px" : "18px",
              right: compact ? "5px" : "18px",
              bottom: compact ? "5px" : "18px",
              height: compact ? "13px" : "38px",
              background: "#7DB06E",
              borderRadius: compact ? "8px" : "14px",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: compact ? "8px" : "24px",
              bottom: compact ? "11px" : "34px",
              width: compact ? "14px" : "34px",
              height: compact ? "10px" : "24px",
              background: "#89B97A",
              transform: "skewX(-18deg)",
              borderRadius: "3px",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: compact ? "18px" : "56px",
              bottom: compact ? "11px" : "34px",
              width: compact ? "18px" : "50px",
              height: compact ? "14px" : "34px",
              background: "#6E9FD8",
              transform: "skewX(-18deg)",
              borderRadius: "4px",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: compact ? "6px" : "20px",
              top: compact ? "6px" : "16px",
              width: compact ? "7px" : "18px",
              height: compact ? "7px" : "18px",
              borderRadius: "50%",
              background: "#FFD66B",
            }}
          />
        </div>
      );
    }
    if (doc.type === "video") {
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(135deg, #252525 0%, #4C4C4C 52%, #2D2D2D 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: compact ? "12px" : "30px",
              background:
                "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 100%)",
            }}
          />
          <div
            style={{
              width: compact ? "22px" : "54px",
              height: compact ? "22px" : "54px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.16)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderTop: compact
                  ? "6px solid transparent"
                  : "10px solid transparent",
                borderBottom: compact
                  ? "6px solid transparent"
                  : "10px solid transparent",
                borderLeft: compact ? "10px solid white" : "16px solid white",
                marginLeft: compact ? "2px" : "4px",
              }}
            />
          </div>
        </div>
      );
    }
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: radius,
        }}
      >
        <DocumentTypeBadge
          fileName={doc.name}
          type={doc.type}
          size={compact ? "preview" : "preview"}
        />
      </div>
    );
  };

  const resetDocumentUploadState = () => {
    setDocumentUploadFileName("");
    setDocumentUploadFileSize(0);
    setDocumentUploadFileObject(null);
    setDocumentUploadDescription("");
    setDocumentUploadDocumentType("other");
    setDocumentUploadError("");
  };

  const handleDocumentUploadFileSelection = (files) => {
    const nextFile = Array.from(files || [])[0];
    if (!nextFile) return;
    const validationMessage = validateUploadFile(nextFile);
    setDocumentUploadFileName(nextFile.name);
    setDocumentUploadFileSize(nextFile.size || 0);
    setDocumentUploadFileObject(nextFile);
    setDocumentUploadError(validationMessage);
  };

  const handleReceiptProofFilesSelected = (files) => {
    const incomingFiles = Array.from(files || []);
    if (incomingFiles.length === 0) return;

    let nextUploadError = "";

    setReceiptProofDocuments((prev) => {
      const nextDocuments = [...prev];
      incomingFiles.forEach((file) => {
        if (nextDocuments.length >= MAX_PROOF_UPLOAD_FILES) {
          nextUploadError = "Max 3 files, 25MB each";
          return;
        }

        const validationMessage = validateUploadFile(file);
        if (validationMessage) {
          nextUploadError = validationMessage;
          return;
        }

        nextDocuments.push(
          createUploadDocumentRecord(file, { description: "" })
        );
      });
      return nextDocuments;
    });

    setReceiptProofUploadError(nextUploadError);
    setReceiptProofDescriptionErrors({});
  };

  const updateReceiptProofDescription = (docId, value) => {
    setReceiptProofDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId ? { ...doc, description: value } : doc
      )
    );
    setReceiptProofUploadError("");
    setReceiptProofDescriptionErrors((prev) => ({ ...prev, [docId]: "" }));
  };

  const handleContinueFromAdjustWo = () => {
    setShowAdjustWoModal(false);
    setShowAutoAdjustWoMessage(true);
    setShowConfirmReceiptModal(true);
  };

  const removeReceiptProofDocument = (docId) => {
    setReceiptProofDocuments((prev) => prev.filter((doc) => doc.id !== docId));
    setReceiptProofDescriptionErrors((prev) => {
      const next = { ...prev };
      delete next[docId];
      return next;
    });
    setReceiptProofUploadError("");
  };

  const filteredDocuments = documents.filter((doc) => {
    const normalizedSearch = documentSearch.toLowerCase();
    const matchesSearch =
      !documentSearch.trim() ||
      doc.name.toLowerCase().includes(normalizedSearch) ||
      (doc.description || "").toLowerCase().includes(normalizedSearch) ||
      (doc.meta || "").toLowerCase().includes(normalizedSearch) ||
      getDocumentTypeLabel(doc.documentType)
        .toLowerCase()
        .includes(normalizedSearch);
    const matchesType =
      documentTypeFilters.length === 0 ||
      documentTypeFilters.includes(getNormalizedDocumentType(doc.documentType));
    return matchesSearch && matchesType;
  });

  const handleUploadDocument = () => {
    if (!(currentStatus === "Draft" || currentStatus === "Need Revision")) {
      setDocumentUploadError(
        "Documents can only be uploaded in Draft or Need Revision status"
      );
      return;
    }
    if (!documentUploadDocumentType) {
      setDocumentUploadError("Document type cannot be empty");
      return;
    }
    if (!documentUploadFileObject || !documentUploadFileName) {
      setDocumentUploadError("Please choose a file");
      return;
    }
    const validationMessage = validateUploadFile(documentUploadFileObject);
    if (validationMessage) {
      setDocumentUploadError(validationMessage);
      return;
    }
    const modifiedLabel = "Mar 31, 2026";
    const newDoc = createUploadDocumentRecord(documentUploadFileObject, {
      id: `doc-${Date.now()}`,
      name: documentUploadFileName,
      description: documentUploadDescription.trim(),
      meta: `Uploaded by Natasha Smith on ${modifiedLabel}`,
      documentType: documentUploadDocumentType,
      modifiedDate: modifiedLabel,
      size: formatUploadFileSize(documentUploadFileSize),
    });
    setDocuments((prev) => [newDoc, ...prev]);
    setDocumentActivityLogs((prev) => [
      {
        name: "Natasha Smith",
        email: "natasha.smith@company.com",
        title: "Document Uploaded",
        desc: newDoc.description
          ? `${newDoc.description} (${newDoc.name})`
          : newDoc.name,
        timestamp: getCurrentLogTimestamp(),
      },
      ...prev,
    ]);
    setShowUploadDocumentModal(false);
    resetDocumentUploadState();
    setDocumentToastMessage("Document successfully uploaded");
    setShowDocumentToast(true);
    setTimeout(() => setShowDocumentToast(false), 4000);
  };

  const handleDocumentAction = (message, docId = null) => {
    if (docId && (message === "delete" || message === "rename")) {
      if (message === "delete") {
        const targetDoc = documents.find((doc) => doc.id === docId);
        setSelectedDocumentId(docId);
        setRenameDocumentValue(targetDoc?.name || "");
        setShowDeleteDocumentModal(true);
        setOpenDocumentMenuId(null);
        return;
      }
      if (message === "rename") {
        const targetDoc = documents.find((doc) => doc.id === docId);
        setSelectedDocumentId(docId);
        setRenameDocumentValue(targetDoc?.name || "");
        setEditDocumentDescriptionValue(targetDoc?.description || "");
        setEditDocumentTypeValue(
          targetDoc?.documentType === "contract"
            ? "contract_agreement"
            : targetDoc?.documentType || "other"
        );
        setShowRenameDocumentModal(true);
        setOpenDocumentMenuId(null);
        return;
      }
    }
    setDocumentToastMessage(message);
    setOpenDocumentMenuId(null);
    setShowDocumentToast(true);
    setTimeout(() => setShowDocumentToast(false), 4000);
  };

  const handleConfirmRenameDocument = () => {
    const trimmedName = renameDocumentValue.trim();
    const trimmedDescription = editDocumentDescriptionValue.trim();
    if (!trimmedName || !selectedDocumentId) return;
    const todayLabel = "Mar 31, 2026";
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === selectedDocumentId
          ? {
            ...doc,
            name: trimmedName,
            description: trimmedDescription,
            documentType: editDocumentTypeValue,
            meta: `Uploaded by Natasha Smith on ${todayLabel}`,
            modifiedDate: todayLabel,
          }
          : doc
      )
    );
    setDocumentActivityLogs((prev) => [
      {
        name: "Natasha Smith",
        email: "natasha.smith@company.com",
        title: "Document Renamed",
        desc: trimmedDescription
          ? `${trimmedName} - ${trimmedDescription}`
          : trimmedName,
        timestamp: getCurrentLogTimestamp(),
      },
      ...prev,
    ]);
    setShowRenameDocumentModal(false);
    setSelectedDocumentId(null);
    setRenameDocumentValue("");
    setEditDocumentDescriptionValue("");
    setEditDocumentTypeValue("other");
    setDocumentToastMessage("Document successfully updated");
    setShowDocumentToast(true);
    setTimeout(() => setShowDocumentToast(false), 4000);
  };

  const toggleDocumentTypeFilter = (filterKey) => {
    setDocumentTypeFilters((prev) =>
      prev.includes(filterKey)
        ? prev.filter((key) => key !== filterKey)
        : [...prev, filterKey]
    );
  };

  const handleConfirmDeleteDocument = () => {
    if (!selectedDocumentId) return;
    const deletedDoc = documents.find((doc) => doc.id === selectedDocumentId);
    setDocuments((prev) => prev.filter((doc) => doc.id !== selectedDocumentId));
    if (deletedDoc) {
      setDocumentActivityLogs((prev) => [
        {
          name: "Natasha Smith",
          email: "natasha.smith@company.com",
          title: "Document Deleted",
          desc: deletedDoc.name,
          timestamp: getCurrentLogTimestamp(),
        },
        ...prev,
      ]);
    }
    setShowDeleteDocumentModal(false);
    setSelectedDocumentId(null);
    setRenameDocumentValue("");
    setDocumentToastMessage("Document successfully deleted");
    setShowDocumentToast(true);
    setTimeout(() => setShowDocumentToast(false), 4000);
  };

  const updateReceiptLine = (lineId, value) => {
    setReceiptLines((prev) =>
      prev.map((line) =>
        line.id === lineId ? { ...line, receiveNow: value } : line
      )
    );
    setReceiptErrors((prev) => ({ ...prev, [lineId]: "" }));
  };

  const handleReceiptConfirmClick = () => {
    const nextErrors = {};
    let hasValue = false;
    let totalReceiveNow = 0;
    let isWoAdjustmentNeeded = false;

    receiptLines.forEach((line) => {
      const receiveNow = Number(line.receiveNow) || 0;
      const remainingQty = line.orderedQty - line.receivedQty;
      if (receiveNow > 0) {
        hasValue = true;
        totalReceiveNow += receiveNow;
      }
      if (receiveNow > remainingQty) {
        nextErrors[line.id] = `Exceeds remaining quantity (${remainingQty} pcs).`;
      }
    });

    if (!hasValue) {
      nextErrors._global = "Fill at least one Receive Now field to proceed";
    }

    setReceiptErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (initialData?.from === "work_order_detail" && initialData?.returnTo?.data) {
      const woData = initialData.returnTo.data;
      const outsourceSteps = woData.outsourceSteps || [];
      if (outsourceSteps.length > 0) {
        const minStep = Math.min(...outsourceSteps);
        const routingStages = woData.routingStages || [];
        const stageIndex = routingStages.findIndex((s) => s.step === minStep);
        if (stageIndex > 0) {
          const currentTotalReceived = (woData.vendors || []).reduce((sum, v) => {
            if (v.name !== "Internal") return sum + Number(v.receivedOutput || 0);
            return sum;
          }, 0);
          const totalAfterThisReceipt = currentTotalReceived + totalReceiveNow;

          const prevStage = routingStages[stageIndex - 1];
          const prevComp = Number(prevStage.totalComp || prevStage.comp || 0);
          if (prevComp < totalAfterThisReceipt) {
            isWoAdjustmentNeeded = true;
          }
        }
      }
    }

    setReceiptProofUploadError("");
    setReceiptProofDescriptionErrors({});
    
    if (isWoAdjustmentNeeded) {
      setShowAdjustWoModal(true);
    } else {
      setShowAutoAdjustWoMessage(false);
      setShowConfirmReceiptModal(true);
    }
  };

  const handleSubmitReceipt = () => {
    const submittedAt = new Date();
    const submittedDate = submittedAt.toISOString().slice(0, 10);
    const submittedTime = submittedAt.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const affectedLines = receiptLines.filter(
      (line) => (Number(line.receiveNow) || 0) > 0
    );
    const normalizedReceiptNotes = receiptNotes.trim() || "-";
    const normalizedProofDocuments = receiptProofDocuments.map((doc) => ({
      ...doc,
      description: (doc.description || "").trim(),
    }));
    const nextProofDescriptionErrors = {};

    if (normalizedProofDocuments.length === 0) {
      setReceiptProofUploadError("Upload at least one proof document");
      return;
    }

    normalizedProofDocuments.forEach((doc) => {
      if (!doc.description) {
        nextProofDescriptionErrors[doc.id] = "Description is required";
      }
    });

    if (Object.keys(nextProofDescriptionErrors).length > 0) {
      setReceiptProofDescriptionErrors(nextProofDescriptionErrors);
      setReceiptProofUploadError("Add description for each proof document");
      return;
    }

    const nextReceiptLines = receiptLines.map((line) => {
      const receivedNow = Number(line.receiveNow) || 0;
      return {
        ...line,
        receivedQty: line.receivedQty + receivedNow,
        receiveNow: "",
      };
    });

    const nextReceiptEntry = {
      id: `receipt-log-${Date.now()}`,
      receiptNumber: `RCPT-${String(receiptLogs.length + 1).padStart(4, "0")}`,
      date: submittedDate,
      time: submittedTime,
      receivedBy: receiptReceivedBy || "-",
      proofDocuments: normalizedProofDocuments,
      notes: normalizedReceiptNotes,
      items: affectedLines.map((line) => ({
        id: line.id,
        item: line.item,
        code: line.code || "-",
        receivedNow: Number(line.receiveNow) || 0,
      })),
    };
    const nextReceiptLogs = [nextReceiptEntry, ...receiptLogs];

    setReceiptLines(nextReceiptLines);
    setReceiptLogs(nextReceiptLogs);
    
    const receivedNowMap = {};
    affectedLines.forEach(line => {
      receivedNowMap[line.id] = Number(line.receiveNow) || 0;
    });
    syncPoToStockBatches("receipt", { receivedNowMap });
    
    setReceiptProofUploadError("");
    setReceiptProofDescriptionErrors({});

    const allRemainingQtyZero =
      nextReceiptLines.length > 0 &&
      nextReceiptLines.every((line) => {
        const remainingQty = Math.max(
          (Number(line.orderedQty) || 0) - (Number(line.receivedQty) || 0),
          0
        );
        return remainingQty === 0;
      });
    const workOrderReceivedNow = affectedLines.reduce(
      (sum, line) =>
        line.type === "wo" || (line.woRef && line.woRef !== "-")
          ? sum + (Number(line.receiveNow) || 0)
          : sum,
      0
    );

    const nextPoStatus = allRemainingQtyZero ? "Completed" : currentStatus;
    const nextPoBadge = allRemainingQtyZero ? "green" : currentBadge;
    
    if (allRemainingQtyZero) {
      syncPoToStockBatches("complete", { completedDate: submittedDate });
    }
    const nextPoStatusKey = allRemainingQtyZero
      ? "completed"
      : initialData?.statusKey || "issued";

    const nextPoSnapshot = buildCurrentPoSnapshot({
      status: nextPoStatus,
      statusKey: nextPoStatusKey,
      sBadge: nextPoBadge,
      receiptLogs: nextReceiptLogs,
      receiptLines: nextReceiptLines,
    });

    // Persist to mock data
    const poIndex = MOCK_PO_TABLE_DATA.findIndex(p => p.poNumber === poNumber);
    if (poIndex !== -1) {
      MOCK_PO_TABLE_DATA[poIndex] = {
        ...MOCK_PO_TABLE_DATA[poIndex],
        status: nextPoStatus,
        statusKey: nextPoStatusKey,
        sBadge: nextPoBadge,
        receiptLogs: nextReceiptLogs,
        receiptLines: nextReceiptLines
      };
    }

    if (
      initialData?.from === "work_order_detail" &&
      initialData?.returnTo?.data
    ) {
      const woData = initialData.returnTo.data;
      let nextRoutingStages = [...(woData.routingStages || [])];
      let nextRoutingUpdates = [...(woData.routingUpdates || [])];

      const updatedReturnData = {
        ...woData,
        vendors: (woData.vendors || []).map((vendor) => {
          if (vendor.poNumber !== poNumber) return vendor;

          const vendorOutput = Number(vendor.output || 0);
          const currentVendorReceived = Number(vendor.receivedOutput || 0);

          const nextVendorReceived =
            workOrderReceivedNow > 0
              ? vendorOutput > 0
                ? Math.min(
                  vendorOutput,
                  currentVendorReceived + workOrderReceivedNow
                )
                  : currentVendorReceived + workOrderReceivedNow
              : currentVendorReceived;

          const totalExternalReceived = (woData.vendors || []).reduce((sum, v) => {
            if (v.poNumber === poNumber) {
              const currentReceived = Number(v.receivedOutput || 0);
              return sum + currentReceived + workOrderReceivedNow;
            }
            if (v.name !== "Internal") {
              return sum + Number(v.receivedOutput || 0);
            }
            return sum;
          }, 0);

          if (showAutoAdjustWoMessage) {
            const outsourceSteps = woData.outsourceSteps || [];
            if (outsourceSteps.length > 0) {
              const minStep = Math.min(...outsourceSteps);
              const stageIndex = nextRoutingStages.findIndex((s) => s.step === minStep);
              
              if (stageIndex > 0) {
                // Update previous stages
                nextRoutingStages = nextRoutingStages.map((stage, idx) => {
                  if (idx < stageIndex) {
                    const currentComp = Number(stage.totalComp || stage.comp || 0);
                    if (currentComp < totalExternalReceived) {
                       return {
                         ...stage,
                         comp: totalExternalReceived,
                         totalComp: totalExternalReceived
                       };
                    }
                  }
                  return stage;
                });

                // Add history entry
                const now = new Date();
                const formattedDate = now.toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                }).replace(",", ""); // e.g. "Apr 22 14:32"

                nextRoutingUpdates.push({
                  qty: totalExternalReceived,
                  timestamp: formattedDate,
                  poNumber: poNumber,
                  vendorName: initialData?.vendorName || "Vendor A",
                  fullDate: now.toISOString(),
                });
              }
            }
          }

          const vendorFullyReceived =
            vendorOutput > 0 && nextVendorReceived >= vendorOutput;

          const nextVendorReceipt =
            workOrderReceivedNow > 0
              ? {
                id: `receipt-log-${Date.now()}`,
                receiptNumber: nextReceiptEntry.receiptNumber,
                amount: workOrderReceivedNow,
                date: submittedDate,
                time: submittedTime,
                receivedBy: receiptReceivedBy || "Natasha Smith",
                note: normalizedReceiptNotes,
                attachments: normalizedProofDocuments,
              }
              : null;

          return {
            ...vendor,
            receivedOutput: nextVendorReceived,
            isPoApproved:
              nextPoStatus === "Issued" || nextPoStatus === "Completed"
                ? true
                : vendor.isPoApproved,
            poStatus: nextPoStatus,
            poBadge: nextPoBadge,
            poStatusKey: nextPoStatusKey,
            poDetailData: nextPoSnapshot,
            status:
              workOrderReceivedNow > 0 || nextVendorReceived > 0
                ? vendorFullyReceived
                  ? "Completed"
                  : "Partially Received"
                : vendor.status,
            receivedDate:
              workOrderReceivedNow > 0
                ? vendorFullyReceived
                  ? submittedDate
                  : vendor.receivedDate || ""
                : vendor.receivedDate,
            receipts: nextVendorReceipt
              ? [...(vendor.receipts || []), nextVendorReceipt]
              : vendor.receipts || [],
          };
        }),
      };

      updatedReturnData.routingStages = nextRoutingStages;
      updatedReturnData.routingUpdates = nextRoutingUpdates;

      initialData.returnTo = {
        ...initialData.returnTo,
        data: updatedReturnData,
      };
    }

    if (allRemainingQtyZero) {
      setCurrentStatus("Completed");
      setCurrentBadge("green");
    }

    setShowConfirmReceiptModal(false);
    setReceiptProofDocuments([]);
    setReceiptReceivedBy("Natasha Smith");
    setReceiptNotes("");
    setReceiptErrors({});
    setActionToastMessage("Receipt successfully confirmed");
    setShowActionToast(true);
    setTimeout(() => setShowActionToast(false), 4000);
  };

  useEffect(() => {
    const syncedState = buildReceiptStateFromLines(
      mockLines,
      currentStatus,
      formData?.receiptLogs || []
    );
    setReceiptLines((prev) => {
      const hasUserReceiptProgress = prev.some(
        (line) =>
          (Number(line.receivedQty) || 0) > 0 ||
          (line.receiveNow || "").toString().trim() !== ""
      );
      if (hasUserReceiptProgress && currentStatus !== "Completed") return prev;
      return syncedState.receiptLines;
    });

    setReceiptLogs((prev) => {
      if (prev.length > 0) return prev;
      return syncedState.receiptLogs;
    });
  }, [currentStatus, mockLines, formData?.receiptLogs]);

  return (
    <div
      ref={pageTopRef}
      style={{
        padding: "24px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        paddingBottom:
          showFooterSubmit || showFooterApprovalActions || showFooterIssuedCancel
            ? "100px"
            : "24px",
        position: "relative",
        background: "#F5F5F7",
      }}
    >
      {showActionToast || showDocumentToast ? (
        <div
          style={{
            position: "fixed",
            top: "84px",
            right: "24px",
            background: showDocumentToast
              ? "var(--status-green-primary)"
              : actionToastVariant === "error"
                ? "var(--status-red-primary)"
                : "var(--status-green-primary)",
            color: showDocumentToast
              ? "var(--status-green-on-primary)"
              : actionToastVariant === "error"
                ? "var(--status-red-on-primary)"
                : "var(--status-green-on-primary)",
            padding: "12px 16px",
            borderRadius: "var(--radius-small)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            boxShadow: "var(--elevation-sm)",
            zIndex: 1000,
            minWidth: "320px",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "var(--text-title-3)" }}>
            {showDocumentToast ? documentToastMessage : actionToastMessage}
          </span>
          <span
            data-no-localize
            translate="no"
            style={{
              fontWeight: "var(--font-weight-bold)",
              cursor: "pointer",
              fontSize: "var(--text-title-3)",
            }}
            onClick={() => {
              setShowActionToast(false);
              setShowDocumentToast(false);
            }}
          >
            Okay
          </span>
        </div>
      ) : null}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "8px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              marginLeft: "-4px",
            }}
            onClick={handleBackNavigation}
          >
            <ChevronLeftIcon
              size={28}
              color="var(--neutral-on-surface-primary)"
            />
            <h1
              style={{
                margin: 0,
                fontSize: "var(--text-large-title)",
                fontWeight: "var(--font-weight-bold)",
              }}
            >
              Purchase Order Detail
            </h1>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "var(--text-title-3)",
            }}
          >
            <span
              style={{
                color: "var(--neutral-on-surface-secondary)",
                cursor: "pointer",
              }}
              onClick={handleBackNavigation}
            >
              Purchase Order
            </span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>
              /
            </span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>
              Purchase Order Detail
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          {showHeaderEdit ? (
            <Button
              variant="outlined"
              leftIcon={EditIcon}
              onClick={handleEditPo}
            >
              Edit PO
            </Button>
          ) : null}
          {showHeaderExportPdf ? (
            <Button
              variant="outlined"
              leftIcon={FileText}
              disabled={isExportingPdf}
              onClick={handleExportPdf}
            >
              {isExportingPdf ? "Exporting PDF..." : "Export as PDF"}
            </Button>
          ) : null}
        </div>
      </div>

      {currentStatus === "Need Revision" || currentStatus === "Canceled" ? (
        <div
          style={{
            border: `1px solid ${currentStatus === "Need Revision" ? "#F5B342" : "#E04B45"
              }`,
            background:
              currentStatus === "Need Revision" ? "#F8EFDF" : "#F8E6E8",
            borderRadius: "16px",
            padding: "20px 22px",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <Info
            size={16}
            strokeWidth={2.1}
            color={
              currentStatus === "Need Revision"
                ? "var(--status-orange-primary)"
                : "var(--status-red-primary)"
            }
            style={{ flexShrink: 0, marginTop: "2px" }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span
              style={{
                fontSize: "var(--text-title-2)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--neutral-on-surface-primary)",
              }}
            >
              {currentStatus === "Need Revision"
                ? "Revision Requested"
                : "Purchase Order Canceled"}
            </span>
            <span
              style={{
                fontSize: "var(--text-title-3)",
                color: "var(--neutral-on-surface-primary)",
                lineHeight: "1.6",
              }}
            >
              {currentStatus === "Need Revision"
                ? revisionMessage
                : canceledMessage}
            </span>
          </div>
        </div>
      ) : null}

      <div
        style={{
          background: "var(--neutral-surface-primary)",
          borderRadius: "16px",
          border: "1px solid var(--neutral-line-separator-1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-headline)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--neutral-on-surface-primary)",
            }}
          >
            {poNumber}
          </span>
          <StatusBadge variant={currentBadge}>{currentStatus}</StatusBadge>
        </div>
        <div
          style={{
            margin: "0 24px",
            borderTop: "1px solid var(--neutral-line-separator-1)",
          }}
        />
        <div
          style={{
            padding: "16px 24px",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "24px",
          }}
        >
          <LabelValue label="PO Date" value={createdDate} />
          <LabelValue
            label="Expected Delivery Date"
            value={expectedDeliveryDate ?? null}
          />
          <LabelValue label="Currency" value="IDR - Indonesian Rupiah" />
          <LabelValue label="Created By" value="Joko" />
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <button
          type="button"
          onClick={() => setActiveTab("details")}
          style={tabButtonStyle(activeTab === "details")}
        >
          PO Details
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("receipt")}
          style={tabButtonStyle(activeTab === "receipt")}
        >
          Receipt
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("documents")}
          style={tabButtonStyle(activeTab === "documents")}
        >
          Documents
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("logs")}
          style={tabButtonStyle(activeTab === "logs")}
        >
          Logs
        </button>
      </div>

      {activeTab === "details" ? (
        <>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div
              style={{
                background: "var(--neutral-surface-primary)",
                borderRadius: "16px",
                border: "1px solid var(--neutral-line-separator-1)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "24px 24px 0 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--text-title-2)",
                    fontWeight: "var(--font-weight-bold)",
                  }}
                >
                  Vendor Information
                </span>
              </div>
              <div
                style={{
                  padding: "20px 24px 24px 24px",
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "24px",
                }}
              >
                <LabelValue label="Vendor Name" value={vendorInfo.name} />
                <LabelValue label="Phone Number" value={vendorInfo.phone} />
                <LabelValue label="Email" value={vendorInfo.email} />
                <LabelValue label="Address" value={vendorInfo.address} />
              </div>
            </div>

            <div
              style={{
                background: "var(--neutral-surface-primary)",
                borderRadius: "16px",
                border: "1px solid var(--neutral-line-separator-1)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "24px 24px 0 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--text-title-2)",
                    fontWeight: "var(--font-weight-bold)",
                  }}
                >
                  Recipient Information
                </span>
              </div>
              <div
                style={{
                  padding: "20px 24px 24px 24px",
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "24px",
                }}
              >
                <LabelValue label="Recipient Name" value={shipToInfo.name} />
                <LabelValue label="Phone Number" value={shipToInfo.phone} />
                <LabelValue label="Email" value={shipToInfo.email} />
                <LabelValue label="Address" value={shipToInfo.address} />
              </div>
            </div>

            <div
              style={{
                background: "var(--neutral-surface-primary)",
                borderRadius: "16px",
                border: "1px solid var(--neutral-line-separator-1)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "24px 24px 0 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--text-title-2)",
                    fontWeight: "var(--font-weight-bold)",
                  }}
                >
                  Purchase Order Lines
                </span>
              </div>
              <div style={{ padding: "20px 24px 24px 24px" }}>
                <div
                  style={{
                    border: "none",
                    borderRadius: "0",
                    overflow: "hidden",
                    width: "100%",
                  }}
                >
                  <div style={{ overflowX: "auto", width: "100%" }}>
                      <div
                        style={{
                          minWidth: "100%",
                          width: "100%",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "76px minmax(220px, 1.5fr) minmax(220px, 2.5fr) 110px 64px 130px 130px",
                          gap: "8px",
                          padding: "0 16px",
                          height: "49px",
                          alignItems: "center",
                          background: "var(--neutral-surface-primary)",
                          position: "relative",
                          width: "100%",
                          boxSizing: "border-box",
                          fontSize: "var(--text-title-3)",
                          fontWeight: "var(--font-weight-bold)",
                          color: "var(--neutral-on-surface-primary)",
                        }}
                      >
                        <span>Type</span>
                        <span>Item</span>
                        <span>Description</span>
                        <span>WO Ref</span>
                        <span style={{ textAlign: "center" }}>Qty</span>
                        <span style={{ textAlign: "right" }}>Unit Price</span>
                        <span style={{ textAlign: "right" }}>Subtotal</span>
                        <div
                          aria-hidden="true"
                          style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            bottom: 0,
                            height: "1px",
                            background: "var(--neutral-line-separator-1)",
                            pointerEvents: "none",
                          }}
                        />
                      </div>

                      {mockLines.length > 0 ? (
                        mockLines.map((line, idx) => {
                          const isWO = line.type === "wo";
                          const lineSubtotal =
                            (parseFloat(line.qty) || 0) *
                            (parseFloat(line.price) || 0);
                          const quantityLabel =
                            line.type === "material" && line.uom
                              ? `${displayValue(line.qty, 0)} ${line.uom}`
                              : displayValue(line.qty, 0);
                          return (
                            <div
                              key={line.id}
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  "76px minmax(220px, 1.5fr) minmax(220px, 2.5fr) 110px 64px 130px 130px",
                                gap: "8px",
                                padding: "0 16px",
                                minHeight: "64px",
                                alignItems: "center",
                                background: "var(--neutral-surface-primary)",
                                position: "relative",
                                width: "100%",
                                borderBottom:
                                  idx === mockLines.length - 1
                                    ? "none"
                                    : "1px solid var(--neutral-line-separator-1)",
                                boxSizing: "border-box",
                              }}
                            >
                              <div>
                                <StatusBadge
                                  variant={
                                    isWO
                                      ? "blue-light"
                                      : line.type === "material"
                                        ? "yellow-light"
                                        : "grey-light"
                                  }
                                >
                                  {isWO
                                    ? "WO"
                                    : line.type === "material"
                                      ? "Material"
                                      : "Manual"}
                                </StatusBadge>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "12px",
                                  padding: "8px 0",
                                  minWidth: 0
                                }}
                              >
                                <div
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "8px",
                                    background:
                                      "var(--neutral-surface-grey-lighter)",
                                    border:
                                      "1px solid var(--neutral-line-separator-1)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    overflow: "hidden",
                                  }}
                                >
                                  {line.image && getImageUploadPreviewUrl(line.image) ? (
                                    <img
                                      src={getImageUploadPreviewUrl(line.image)}
                                      alt={line.item}
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                      }}
                                    />
                                  ) : (
                                    <ImageAssetIcon
                                      size={20}
                                      color="var(--neutral-on-surface-tertiary)"
                                    />
                                  )}
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                                  <span
                                    style={{
                                      display: "block",
                                      fontSize: "var(--text-title-3)",
                                      fontWeight: "var(--font-weight-bold)",
                                      color: "var(--neutral-on-surface-primary)",
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                    title={displayValue(line.item)}
                                  >
                                    {displayValue(line.item)}
                                  </span>
                                  <span
                                    style={{
                                      display: "block",
                                      fontSize: "var(--text-title-3)",
                                      color: "var(--feature-brand-primary)",
                                      textDecoration: "underline",
                                      cursor: "pointer",
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                    title={displayValue(line.code)}
                                    onClick={() => {
                                      const materialData = MOCK_MATERIALS_DATA.find(m => m.sku === line.code) || MOCK_MATERIALS_DATA[0];
                                      onNavigate("materials_detail", {
                                        ...materialData,
                                        from: "purchase_order_detail",
                                        returnTo: {
                                          view: "purchase_order_detail",
                                          data: poNumber
                                        }
                                      });
                                    }}
                                  >
                                    {displayValue(line.code)}
                                  </span>
                                </div>
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <Tooltip content={line.desc}>
                                  <span
                                    style={{
                                      display: "-webkit-box",
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: "vertical",
                                      overflow: "hidden",
                                      fontSize: "var(--text-title-3)",
                                      color:
                                        "var(--neutral-on-surface-secondary)",
                                      lineHeight: "1.4",
                                    }}
                                    title={displayValue(line.desc)}
                                  >
                                    {displayValue(line.desc)}
                                  </span>
                                </Tooltip>
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <span
                                  onClick={() => {
                                    if (!line.woRef || line.woRef === "-")
                                      return;
                                    const woData = MOCK_WO_TABLE_DATA.find(
                                      (w) => w.wo === line.woRef
                                    );
                                    if (woData) {
                                      onNavigate("work_order_detail", {
                                        ...woData,
                                        from: "purchase_order_detail",
                                        returnTo: {
                                          view: "detail",
                                          data: poNumber,
                                        },
                                      });
                                    }
                                  }}
                                  style={{
                                    display: "block",
                                    fontSize: "var(--text-title-3)",
                                    color:
                                      line.woRef && line.woRef !== "-"
                                        ? "var(--feature-brand-primary)"
                                        : "var(--neutral-on-surface-primary)",
                                    textDecoration:
                                      line.woRef && line.woRef !== "-"
                                        ? "underline"
                                        : "none",
                                    cursor:
                                      line.woRef && line.woRef !== "-"
                                        ? "pointer"
                                        : "default",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                  title={displayValue(line.woRef)}
                                >
                                  {displayValue(line.woRef)}
                                </span>
                              </div>
                              <div
                                style={{
                                  textAlign: "center",
                                  fontSize: "var(--text-title-3)",
                                  color: "var(--neutral-on-surface-primary)",
                                }}
                                title={quantityLabel}
                              >
                                {quantityLabel}
                              </div>
                              <div
                                style={{
                                  textAlign: "right",
                                  fontSize: "var(--text-title-3)",
                                  color: "var(--neutral-on-surface-primary)",
                                }}
                              >
                                {formatCurrency(line.price, currency)}
                              </div>
                              <div
                                style={{
                                  textAlign: "right",
                                  fontSize: "var(--text-title-3)",
                                  fontWeight: "var(--font-weight-bold)",
                                  color: "var(--neutral-on-surface-primary)",
                                }}
                              >
                                {formatCurrency(lineSubtotal, currency)}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div
                          style={{
                            padding: "32px",
                            textAlign: "center",
                            color: "var(--neutral-on-surface-tertiary)",
                            fontSize: "var(--text-title-3)",
                            background: "var(--neutral-surface-primary)",
                          }}
                        >
                          No purchase order lines added.
                        </div>
                      )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            <div
              style={{
                background: "var(--neutral-surface-primary)",
                borderRadius: "16px",
                border: "1px solid var(--neutral-line-separator-1)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "24px 24px 0 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--text-title-2)",
                    fontWeight: "var(--font-weight-bold)",
                  }}
                >
                  Summary
                </span>
              </div>
              <div
                style={{
                  padding: "20px 24px 24px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "var(--text-title-3)",
                  gap: "16px",
                }}
              >
                <span style={{ color: "var(--neutral-on-surface-secondary)" }}>
                  Subtotal
                </span>
                <span style={{ fontWeight: "var(--font-weight-bold)" }}>
                  {formatCurrency(subtotal, currency)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "var(--text-title-3)",
                  gap: "16px",
                }}
              >
                <span style={{ color: "var(--neutral-on-surface-secondary)" }}>
                  Tax ({formData ? Number(formData.tax) || 0 : 11}%)
                </span>
                <span style={{ fontWeight: "var(--font-weight-bold)" }}>
                  {formatCurrency(tax, currency)}
                </span>
              </div>
              {summaryFeeRows.map((fee) => (
                <div
                  key={fee.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "20px",
                    fontSize: "var(--text-title-3)",
                  }}
                >
                  <span
                    style={{
                      color: "var(--neutral-on-surface-secondary)",
                    }}
                  >
                    {fee.name}
                  </span>
                  <span style={{ fontWeight: "var(--font-weight-bold)" }}>
                    {formatCurrency(fee.amount, currency)}
                  </span>
                </div>
              ))}
              <div
                style={{
                  borderTop: "1px solid var(--neutral-line-separator-1)",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "var(--text-title-1)",
                  fontWeight: "var(--font-weight-black)",
                }}
              >
                <span>Total</span>
                <span>{formatCurrency(total, currency)}</span>
              </div>
            </div>
          </div>

            <div
              style={{
                background: "var(--neutral-surface-primary)",
                borderRadius: "16px",
                border: "1px solid var(--neutral-line-separator-1)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "24px 24px 0 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--text-title-2)",
                    fontWeight: "var(--font-weight-bold)",
                  }}
                >
                  Notes & Terms
                </span>
              </div>
              <div
                style={{
                  padding: "20px 24px 24px 24px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "24px 40px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "var(--text-body)",
                      color: "var(--neutral-on-surface-secondary)",
                    }}
                  >
                    Notes
                  </span>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "var(--text-title-3)",
                      color: "var(--neutral-on-surface-primary)",
                      lineHeight: "1.6",
                    }}
                  >
                    {detailNotes}
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "var(--text-body)",
                      color: "var(--neutral-on-surface-secondary)",
                    }}
                  >
                    Terms
                  </span>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "var(--text-title-3)",
                      color: "var(--neutral-on-surface-primary)",
                      lineHeight: "1.6",
                    }}
                  >
                    {detailTerms}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : activeTab === "documents" ? (
        <div
          style={{
            background: "var(--neutral-surface-primary)",
            borderRadius: "16px",
            border: "1px solid var(--neutral-line-separator-1)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "16px",
                flexWrap: "wrap",
                padding: "20px 24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ position: "relative" }}>
                  <div
                    ref={documentFilterTriggerRef}
                    onClick={() => {
                      if (showDocumentFilterMenu) {
                        setShowDocumentFilterMenu(false);
                        return;
                      }
                      updateDocumentFilterMenuPosition();
                      setShowDocumentFilterMenu(true);
                    }}
                  >
                    <FilterPill
                      label="Document Type"
                      active={documentTypeFilters.length > 0}
                      isOpen={showDocumentFilterMenu}
                      count={documentTypeFilters.length}
                    />
                  </div>

                  {showDocumentFilterMenu ? (
                    <>
                      <div
                        style={{ position: "fixed", inset: 0, zIndex: 999 }}
                        onClick={() => setShowDocumentFilterMenu(false)}
                      />
                      <div
                        style={{
                          position: "fixed",
                          top: `${documentFilterMenuPosition.top}px`,
                          left: `${documentFilterMenuPosition.left}px`,
                          transform:
                            documentFilterMenuPosition.placement === "top"
                              ? "translateY(-100%)"
                              : "none",
                          width: "360px",
                          background: "var(--neutral-surface-primary)",
                          border: "1px solid var(--neutral-line-separator-1)",
                          borderRadius: "var(--radius-card)",
                          boxShadow: "var(--elevation-sm)",
                          padding: "16px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "16px",
                          zIndex: 1000,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "var(--text-title-2)",
                              fontWeight: "var(--font-weight-bold)",
                              color: "var(--neutral-on-surface-primary)",
                            }}
                          >
                            Document Type
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setDocumentTypeFilters([]);
                              setShowDocumentFilterMenu(false);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              padding: 0,
                              color: "var(--status-red-primary)",
                              cursor: "pointer",
                              fontSize: "var(--text-body)",
                              fontWeight: "var(--font-weight-bold)",
                            }}
                          >
                            Remove Filter
                          </button>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                          }}
                        >
                          {documentTypeFilterOptions.map((opt) => {
                            const isSelected = documentTypeFilters.includes(
                              opt.value
                            );
                            return (
                            <label
                              key={opt.value}
                              onClick={() => toggleDocumentTypeFilter(opt.value)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                cursor: "pointer",
                                fontSize: "var(--text-title-3)",
                                color: "var(--neutral-on-surface-primary)",
                                textAlign: "left",
                              }}
                            >
                              <Checkbox
                                checked={isSelected}
                                onChange={() =>
                                  toggleDocumentTypeFilter(opt.value)
                                }
                              />
                              <span>{opt.label}</span>
                            </label>
                          );
                        })}
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  flexShrink: 0,
                }}
              >
                <TableSearchField
                  value={documentSearch}
                  onChange={(e) => setDocumentSearch(e.target.value)}
                  placeholder="Search documents"
                  width="320px"
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid var(--neutral-line-separator-1)",
                    borderRadius: "12px",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setOpenDocumentMenuId(null);
                      setDocumentView("list");
                    }}
                    style={{
                      width: "40px",
                      height: "40px",
                      border: "1px solid var(--neutral-line-separator-1)",
                      background:
                        documentView === "list"
                          ? "var(--feature-brand-container-darker)"
                          : "var(--neutral-surface-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <ListViewIcon
                      size={18}
                      color={
                        documentView === "list"
                          ? "var(--feature-brand-primary)"
                          : "var(--neutral-on-surface-secondary)"
                      }
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenDocumentMenuId(null);
                      setDocumentView("grid");
                    }}
                    style={{
                      width: "40px",
                      height: "40px",
                      border: "1px solid var(--neutral-line-separator-1)",
                      borderLeft: "1px solid var(--neutral-line-separator-2)",
                      background:
                        documentView === "grid"
                          ? "var(--feature-brand-container-darker)"
                          : "var(--neutral-surface-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <GridViewIcon
                      size={18}
                      color={
                        documentView === "grid"
                          ? "var(--feature-brand-primary)"
                          : "var(--neutral-on-surface-secondary)"
                      }
                    />
                  </button>
                </div>
                <Button
                  variant="filled"
                  leftIcon={UploadIcon}
                  disabled={
                    !(
                      currentStatus === "Draft" ||
                      currentStatus === "Need Revision"
                    )
                  }
                  onClick={() => {
                    resetDocumentUploadState();
                    setShowUploadDocumentModal(true);
                  }}
                >
                  Upload
                </Button>
              </div>
            </div>

            <div
              style={{
                height: "1px",
                background: "var(--neutral-line-separator-1)",
                width: "100%",
              }}
            />

            <div style={{ padding: "0 0 24px 0" }}>

            {documentView === "list" ? (
              <div style={poReferenceTableFrameStyle}>
                <div style={poReferenceTableScrollerStyle}>
                  <div style={poReferenceTableInnerStyle("1080px")}>
                    <div
                      style={poReferenceTableHeaderRowStyle(
                        "2.2fr 1fr 1.2fr 1fr 0.9fr 132px"
                      )}
                    >
                      <div style={poReferenceTableHeaderCellStyle()}>Name</div>
                      <div style={poReferenceTableHeaderCellStyle()}>
                        Document Type
                      </div>
                      <div style={poReferenceTableHeaderCellStyle()}>
                        Uploaded By
                      </div>
                      <div style={poReferenceTableHeaderCellStyle()}>
                        Date Modified
                      </div>
                      <div style={poReferenceTableHeaderCellStyle()}>
                        File Size
                      </div>
                      <div
                        style={poReferenceTableHeaderCellStyle({
                          justifyContent: "flex-end",
                        })}
                      >
                        Action
                      </div>
                    </div>

                    {filteredDocuments.length > 0 ? (
                      filteredDocuments.map((doc, idx) => {
                        const metaText = doc.meta || "";
                        const uploadedBy =
                          metaText.indexOf("Uploaded by ") === 0
                            ? metaText.slice(12).split(" on ")[0]
                            : "-";
                        const modifiedDate =
                          doc.modifiedDate ||
                          (metaText.indexOf(" on ") > -1
                            ? metaText.split(" on ")[1]
                            : "-");
                        const primaryLabel = getDocumentPrimaryLabel(doc);
                        const secondaryLabel = getDocumentSecondaryLabel(doc);
                        return (
                          <div
                            key={doc.id}
                            style={poReferenceTableRowStyle(
                              "2.2fr 1fr 1.2fr 1fr 0.9fr 132px",
                              idx === filteredDocuments.length - 1
                            )}
                          >
                            <div
                              style={poReferenceTableCellStyle({
                                gap: "12px",
                                minWidth: 0,
                              })}
                            >
                              <div
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  borderRadius: "12px",
                                  flexShrink: 0,
                                  overflow: "hidden",
                                }}
                              >
                                {getDocumentPreview(doc, true)}
                              </div>
                              <div
                                style={{
                                  minWidth: 0,
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "2px",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "var(--text-title-3)",
                                    fontWeight: "var(--font-weight-bold)",
                                    color: "var(--neutral-on-surface-primary)",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    display: "block",
                                  }}
                                >
                                  {primaryLabel}
                                </span>
                                {secondaryLabel ? (
                                  <span
                                    style={{
                                      fontSize: "var(--text-body)",
                                      color:
                                        "var(--neutral-on-surface-secondary)",
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      display: "block",
                                    }}
                                  >
                                    {secondaryLabel}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                            <div
                              style={poReferenceTableCellStyle({
                                color: "var(--neutral-on-surface-secondary)",
                              })}
                            >
                              {getDocumentTypeLabel(doc.documentType)}
                            </div>
                            <div style={poReferenceTableCellStyle()}>
                              {uploadedBy}
                            </div>
                            <div style={poReferenceTableCellStyle()}>
                              {modifiedDate}
                            </div>
                            <div style={poReferenceTableCellStyle()}>
                              {doc.size || "-"}
                            </div>
                            <div
                              style={poReferenceTableCellStyle({
                                justifyContent: "flex-end",
                              })}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "flex-end",
                                  gap: "6px",
                                }}
                              >
                                <Tooltip content="Download">
                                  <IconButton
                                    icon={DownloadIcon}
                                    size="small"
                                    title="Download"
                                    onClick={() =>
                                      handleDocumentAction(
                                        "Document successfully downloaded"
                                      )
                                    }
                                  />
                                </Tooltip>
                                <Tooltip content="Edit">
                                  <IconButton
                                    icon={EditIcon}
                                    size="small"
                                    title="Edit"
                                    onClick={() =>
                                      handleDocumentAction("rename", doc.id)
                                    }
                                  />
                                </Tooltip>
                                <Tooltip content="Delete">
                                  <IconButton
                                    icon={DeleteIcon}
                                    size="small"
                                    title="Delete"
                                    color="var(--status-red-primary)"
                                    hoverBackground="#FAE6E8"
                                    onClick={() =>
                                      handleDocumentAction("delete", doc.id)
                                    }
                                  />
                                </Tooltip>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div
                        style={{
                          ...poReferenceTableEmptyStateStyle,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "var(--text-title-2)",
                            fontWeight: "var(--font-weight-bold)",
                          }}
                        >
                          No documents found
                        </span>
                        <span
                          style={{
                            fontSize: "var(--text-title-3)",
                            color: "var(--neutral-on-surface-secondary)",
                          }}
                        >
                          Try changing your search or filter.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  gap: "16px",
                  padding: "20px 24px 0 24px",
                }}
              >
                {filteredDocuments.length > 0 ? (
                  filteredDocuments.map((doc) => {
                    const metaText = doc.meta || "";
                    const uploadedBy =
                      metaText.indexOf("Uploaded by ") === 0
                        ? metaText.slice(12).split(" on ")[0]
                        : "-";
                    const modifiedDate =
                      doc.modifiedDate ||
                      (metaText.indexOf(" on ") > -1
                        ? metaText.split(" on ")[1]
                        : "-");
                    const primaryLabel = getDocumentPrimaryLabel(doc);
                    const secondaryLabel = getDocumentSecondaryLabel(doc);
                    return (
                      <div
                        key={doc.id}
                        style={{
                          border: "1px solid var(--neutral-line-separator-1)",
                          borderRadius: "16px",
                          background: "var(--neutral-surface-primary)",
                          overflow: "hidden",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <div style={{ height: "152px", overflow: "hidden" }}>
                          {getDocumentPreview(doc, false)}
                        </div>
                        <div
                          style={{
                            padding: "16px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: "8px",
                              alignItems: "flex-start",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "2px",
                                flex: 1,
                                minWidth: 0,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "var(--text-title-3)",
                                  fontWeight: "var(--font-weight-bold)",
                                  color: "var(--neutral-on-surface-primary)",
                                  lineHeight: "1.5",
                                  minWidth: 0,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {primaryLabel}
                              </span>
                              {secondaryLabel ? (
                                <span
                                  style={{
                                    fontSize: "var(--text-body)",
                                    color:
                                      "var(--neutral-on-surface-secondary)",
                                    lineHeight: "1.4",
                                    minWidth: 0,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {secondaryLabel}
                                </span>
                              ) : null}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                              }}
                            >
                              <IconButton
                                icon={MoreVerticalIcon}
                                size="small"
                                title="More actions"
                                style={{
                                  width: "28px",
                                  height: "28px",
                                }}
                                color="var(--neutral-on-surface-secondary)"
                                onClick={(event) =>
                                  openDocumentActionMenu(event, doc.id)
                                }
                              />
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "6px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "var(--text-body)",
                                color: "var(--neutral-on-surface-secondary)",
                              }}
                            >
                              Document Type:{" "}
                              {getDocumentTypeLabel(doc.documentType)}
                            </span>
                            <span
                              style={{
                                fontSize: "var(--text-body)",
                                color: "var(--neutral-on-surface-secondary)",
                              }}
                            >
                              Uploaded by: {uploadedBy}
                            </span>
                            <span
                              style={{
                                fontSize: "var(--text-body)",
                                color: "var(--neutral-on-surface-secondary)",
                              }}
                            >
                              Date modified: {modifiedDate}
                            </span>
                            <span
                              style={{
                                fontSize: "var(--text-body)",
                                color: "var(--neutral-on-surface-secondary)",
                              }}
                            >
                              File size: {doc.size || "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      padding: "48px 24px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "var(--text-title-2)",
                        fontWeight: "var(--font-weight-bold)",
                      }}
                    >
                      No documents found
                    </span>
                    <span
                      style={{
                        fontSize: "var(--text-title-3)",
                        color: "var(--neutral-on-surface-secondary)",
                      }}
                    >
                      Try changing your search or filter.
                    </span>
                  </div>
                )}
              </div>
            )}
              {openDocumentMenuId ? (
                <>
                  <div
                    style={{
                      position: "fixed",
                      inset: 0,
                      zIndex: 998,
                    }}
                    onClick={() => setOpenDocumentMenuId(null)}
                  />
                  <div
                    style={{
                      position: "fixed",
                      top: `${documentMenuPosition.top}px`,
                      left: `${documentMenuPosition.left}px`,
                      transform:
                        documentMenuPosition.placement === "top"
                          ? "translateY(-100%)"
                          : "none",
                      width: "220px",
                      background: "var(--neutral-surface-primary)",
                      border: "1px solid var(--neutral-line-separator-1)",
                      borderRadius: "var(--radius-card)",
                      boxShadow: "var(--elevation-sm)",
                      padding: "4px 8px 8px",
                      display: "flex",
                      flexDirection: "column",
                      zIndex: 999,
                      overflow: "hidden",
                    }}
                  >
                    {[
                      {
                        label: "Download",
                        icon: DownloadIcon,
                        action: () =>
                          handleDocumentAction(
                            "Document successfully downloaded"
                          ),
                      },
                      {
                        label: "Edit",
                        icon: EditIcon,
                        action: () =>
                          handleDocumentAction("rename", openDocumentMenuId),
                      },
                      {
                        label: "Delete",
                        icon: DeleteIcon,
                        action: () =>
                          handleDocumentAction("delete", openDocumentMenuId),
                        destructive: true,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        style={{
                          borderTop:
                            item.label === "Download"
                              ? "none"
                              : "1px solid var(--neutral-line-separator-1)",
                        }}
                      >
                        <button
                          type="button"
                          onClick={item.action}
                          onMouseEnter={(event) => {
                            event.currentTarget.style.background =
                              "var(--neutral-surface-grey-lighter)";
                          }}
                          onMouseLeave={(event) => {
                            event.currentTarget.style.background =
                              "transparent";
                          }}
                          style={{
                            width: "100%",
                            minHeight: "40px",
                            border: "none",
                            background: "transparent",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            cursor: "pointer",
                            color: item.destructive
                              ? "var(--status-red-primary)"
                              : "var(--neutral-on-surface-primary)",
                            fontSize: "var(--text-title-3)",
                            fontWeight: "var(--font-weight-regular)",
                            textAlign: "left",
                            transition: "background 0.2s ease",
                          }}
                        >
                          <item.icon
                            size={16}
                            color={
                              item.destructive
                                ? "var(--status-red-primary)"
                                : "var(--neutral-on-surface-secondary)"
                            }
                          />
                          <span>{item.label}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
          </div>
        </div>
      </div>
      ) : activeTab === "receipt" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              background: "var(--neutral-surface-primary)",
              borderRadius: "16px",
              border: "1px solid var(--neutral-line-separator-1)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "24px 24px 0 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <span
                style={{
                  fontSize: "var(--text-title-2)",
                  fontWeight: "var(--font-weight-bold)",
                }}
              >
                Receipt
              </span>
              <Button
                variant="filled"
                onClick={handleReceiptConfirmClick}
                disabled={!canConfirmReceipt}
              >
                Confirm Receipt
              </Button>
            </div>
            <div
              style={{
                padding: "20px 24px 24px 24px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {!canConfirmReceipt ? (
                <div
                  style={{
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    background: "var(--feature-brand-container-lighter)",
                    border: "1px solid var(--feature-brand-container-darker)",
                  }}
                >
                  <Info
                    size={16}
                    strokeWidth={2.1}
                    color="var(--feature-brand-primary)"
                    style={{ flexShrink: 0, marginTop: "2px" }}
                  />
                  <span
                    style={{
                      fontSize: "var(--text-title-3)",
                      color: "var(--feature-brand-primary)",
                      lineHeight: "1.5",
                    }}
                  >
                    Receipt confirmation is only available when the purchase
                    order status is Issued.
                  </span>
                </div>
              ) : null}
              <div style={poReferenceTableFrameStyle}>
                <div style={poReferenceTableScrollerStyle}>
                  <div style={poReferenceTableInnerStyle("100%")}>
                    <div
                      style={poReferenceTableHeaderRowStyle(
                        "70px minmax(200px, 1.5fr) minmax(200px, 2.5fr) 100px 100px 100px 100px 110px",
                        "8px"
                      )}
                    >
                      <div style={poReferenceTableHeaderCellStyle()}>Type</div>
                      <div style={poReferenceTableHeaderCellStyle()}>Item</div>
                      <div style={poReferenceTableHeaderCellStyle()}>
                        Description
                      </div>
                      <div style={poReferenceTableHeaderCellStyle()}>
                        WO Ref
                      </div>
                      <div style={poReferenceTableHeaderCellStyle()}>
                        Ordered Qty
                      </div>
                      <div style={poReferenceTableHeaderCellStyle()}>
                        Received Qty
                      </div>
                      <div style={poReferenceTableHeaderCellStyle()}>
                        Remaining Qty
                      </div>
                      <div style={poReferenceTableHeaderCellStyle()}>
                        Receive Now
                      </div>
                    </div>
                    {receiptLines.map((line, idx) => {
                      const remainingQty = Math.max(
                        line.orderedQty - line.receivedQty,
                        0
                      );
                      const lineTypeLabel =
                        line.type === "wo"
                          ? "WO"
                          : line.type === "material"
                            ? "Material"
                            : "Manual";
                      const lineTypeVariant =
                        line.type === "wo"
                          ? "blue-light"
                          : line.type === "material"
                            ? "yellow-light"
                            : "grey-light";
                      return (
                        <div
                          key={line.id}
                           style={poReferenceTableRowStyle(
                            "70px minmax(200px, 1.5fr) minmax(200px, 2.5fr) 100px 100px 100px 100px 110px",
                            idx === receiptLines.length - 1,
                            { minHeight: "64px", gap: "8px" }
                          )}
                        >
                          <div style={poReferenceTableCellStyle()}>
                            <StatusBadge variant={lineTypeVariant}>
                              {lineTypeLabel}
                            </StatusBadge>
                          </div>
                          <div
                            style={poReferenceTableCellStyle({
                              minWidth: 0,
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              padding: "8px 0"
                            })}
                          >
                            <div
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "8px",
                                background:
                                  "var(--neutral-surface-grey-lighter)",
                                border:
                                  "1px solid var(--neutral-line-separator-1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                overflow: "hidden",
                              }}
                            >
                              {line.image && getImageUploadPreviewUrl(line.image) ? (
                                <img
                                  src={getImageUploadPreviewUrl(line.image)}
                                  alt={line.item}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <ImageAssetIcon
                                  size={20}
                                  color="var(--neutral-on-surface-tertiary)"
                                />
                              )}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                              <span
                                style={{
                                  display: "block",
                                  fontSize: "var(--text-title-3)",
                                  fontWeight: "var(--font-weight-bold)",
                                  color: "var(--neutral-on-surface-primary)",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                                title={displayValue(line.item)}
                              >
                                {displayValue(line.item)}
                              </span>
                              <span
                                style={{
                                  display: "block",
                                  fontSize: "var(--text-title-3)",
                                  color: "var(--feature-brand-primary)",
                                  textDecoration: "underline",
                                  cursor: "pointer",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                                title={displayValue(line.code)}
                                onClick={() => {
                                  const materialData = MOCK_MATERIALS_DATA.find(m => m.sku === line.code) || MOCK_MATERIALS_DATA[0];
                                  onNavigate("materials_detail", {
                                    ...materialData,
                                    from: "purchase_order_detail",
                                    returnTo: {
                                      view: "purchase_order_detail",
                                      data: initialData
                                    }
                                  });
                                }}
                              >
                                {displayValue(line.code)}
                              </span>
                            </div>
                          </div>
                          <div
                            style={poReferenceTableCellStyle({
                              minWidth: 0,
                              color: "var(--neutral-on-surface-secondary)",
                            })}
                          >
                            <Tooltip content={line.desc}>
                              <span
                                style={{
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  lineHeight: "1.4",
                                }}
                                title={displayValue(line.desc)}
                              >
                                {displayValue(line.desc)}
                              </span>
                            </Tooltip>
                          </div>
                          <div style={poReferenceTableCellStyle({ minWidth: 0 })}>
                            <span
                              onClick={() => {
                                if (!line.woRef || line.woRef === "-") return;
                                const woData = MOCK_WO_TABLE_DATA.find(
                                  (w) => w.wo === line.woRef
                                );
                                if (woData) {
                                  onNavigate("work_order_detail", {
                                    ...woData,
                                    from: "purchase_order_detail",
                                    returnTo: {
                                      view: "detail",
                                      data: initialData,
                                    },
                                  });
                                }
                              }}
                              style={{
                                display: "block",
                                width: "100%",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                color:
                                  line.woRef && line.woRef !== "-"
                                    ? "var(--feature-brand-primary)"
                                    : "inherit",
                                textDecoration:
                                  line.woRef && line.woRef !== "-"
                                    ? "underline"
                                    : "none",
                                cursor:
                                  line.woRef && line.woRef !== "-"
                                    ? "pointer"
                                    : "default",
                              }}
                              title={displayValue(line.woRef)}
                            >
                              {displayValue(line.woRef)}
                            </span>
                          </div>
                          <div style={poReferenceTableCellStyle()}>
                            {line.orderedQty}
                          </div>
                          <div style={poReferenceTableCellStyle()}>
                            {line.receivedQty}
                          </div>
                          <div style={poReferenceTableCellStyle()}>
                            {remainingQty}
                          </div>
                          <div style={poReferenceTableCellStyle()}>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "6px",
                                width: "100%",
                                padding: "9px 0",
                              }}
                            >
                              <input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={line.receiveNow}
                                onChange={(e) =>
                                  updateReceiptLine(line.id, e.target.value)
                                }
                                style={{
                                  height: "46px",
                                  border: "1px solid transparent",
                                  background:
                                    remainingQty === 0 ||
                                      !canConfirmReceipt
                                      ? "var(--neutral-surface-grey-lighter)"
                                      : "var(--neutral-surface-primary)",
                                  ...inputFrameStyle(
                                    remainingQty === 0 ||
                                    !canConfirmReceipt,
                                    !!receiptErrors[line.id]
                                  ),
                                  ...inputControlStyle(
                                    remainingQty === 0 ||
                                    !canConfirmReceipt,
                                    !!line.receiveNow
                                  ),
                                  padding: "0 14px",
                                  cursor:
                                    !canConfirmReceipt
                                      ? "not-allowed"
                                      : "text",
                                }}
                                disabled={
                                  remainingQty === 0 ||
                                  !canConfirmReceipt
                                }
                                onFocus={(e) =>
                                  focusInputFrame(e.currentTarget)
                                }
                                onBlur={(e) =>
                                  blurInputFrame(
                                    e.currentTarget,
                                    remainingQty === 0 ||
                                    !canConfirmReceipt,
                                    !!receiptErrors[line.id]
                                  )
                                }
                              />
                              {receiptErrors[line.id] ? (
                                <span
                                  style={{
                                    fontSize: "var(--text-body)",
                                    color: "var(--status-red-primary)",
                                  }}
                                >
                                  {receiptErrors[line.id]}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              {receiptErrors._global ? (
                <span
                  style={{
                    marginTop: "12px",
                    fontSize: "var(--text-body)",
                    color: "var(--status-red-primary)",
                  }}
                >
                  {receiptErrors._global}
                </span>
              ) : null}
            </div>
          </div>

          <div
            style={{
              background: "var(--neutral-surface-primary)",
              borderRadius: "16px",
              border: "1px solid var(--neutral-line-separator-1)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "24px 24px 0 24px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "var(--text-title-2)",
                  fontWeight: "var(--font-weight-bold)",
                }}
              >
                Receipt Logs
              </span>
            </div>
            <div
              style={{
                padding: "20px 24px 24px 24px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={poReferenceTableFrameStyle}>
                <div style={poReferenceTableScrollerStyle}>
                  <div style={poReferenceTableInnerStyle("1400px")}>
                    <div
                      style={poReferenceTableHeaderRowStyle(
                        "1.2fr 1fr 1.4fr 1fr 1.3fr 1.1fr 1.4fr 1.6fr",
                        "8px"
                      )}
                    >
                      <div style={poReferenceTableHeaderCellStyle()}>
                        Receipt Date & Time
                      </div>
                      <div style={poReferenceTableHeaderCellStyle()}>
                        Receipt Number
                      </div>
                      <div style={poReferenceTableHeaderCellStyle()}>
                        Item Name
                      </div>
                      <div style={poReferenceTableHeaderCellStyle()}>
                        SKU / Code
                      </div>
                      <div style={poReferenceTableHeaderCellStyle()}>
                        Received Qty
                      </div>
                      <div style={poReferenceTableHeaderCellStyle()}>
                        Received By
                      </div>
                      <div style={poReferenceTableHeaderCellStyle()}>
                        Notes
                      </div>
                      <div style={poReferenceTableHeaderCellStyle()}>
                        Proof Document
                      </div>
                    </div>
                    {groupedReceiptLogs.length > 0 ? (
                      groupedReceiptLogs.map((log, idx) => (
                        <div
                          key={log.id}
                          style={poReferenceTableRowStyle(
                            "1.2fr 1fr 1.4fr 1fr 1.3fr 1.1fr 1.4fr 1.6fr",
                            idx === groupedReceiptLogs.length - 1,
                            { alignItems: "start", gap: "8px" }
                          )}
                        >
                          <div
                            style={poReferenceTableCellStyle({
                              alignItems: "flex-start",
                              padding: "12px 0",
                            })}
                          >
                            {log.date} · {log.time}
                          </div>
                          <div
                            style={poReferenceTableCellStyle({
                              alignItems: "flex-start",
                              padding: "12px 0",
                            })}
                          >
                            {log.receiptNumber || "-"}
                          </div>
                          <div
                            style={poReferenceTableCellStyle({
                              alignItems: "flex-start",
                              padding: "12px 0",
                              flexDirection: "column",
                              gap: "10px",
                            })}
                          >
                            {(log.items || []).map((item, itemIndex) => (
                              <span
                                key={`${log.id}-item-${item.id || itemIndex}`}
                                style={{
                                  fontSize: "var(--text-title-3)",
                                  lineHeight: "20px",
                                  letterSpacing: "0.09625px",
                                  fontWeight: "var(--font-weight-bold)",
                                  color: "var(--neutral-on-surface-primary)",
                                }}
                              >
                                {item.item || "-"}
                              </span>
                            ))}
                          </div>
                           <div
                            style={poReferenceTableCellStyle({
                              alignItems: "flex-start",
                              padding: "12px 0",
                              flexDirection: "column",
                              gap: "10px",
                            })}
                          >
                            {(log.items || []).map((item, itemIndex) => (
                              <span
                                key={`${log.id}-code-${item.id || itemIndex}`}
                                style={{
                                  fontSize: "var(--text-title-3)",
                                  lineHeight: "20px",
                                  letterSpacing: "0.09625px",
                                  color: "var(--feature-brand-primary)",
                                  textDecoration: "underline",
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  const materialData = MOCK_MATERIALS_DATA.find(m => m.sku === item.code) || MOCK_MATERIALS_DATA[0];
                                  onNavigate("materials_detail", {
                                    ...materialData,
                                    from: "purchase_order_detail",
                                    returnTo: {
                                      view: "purchase_order_detail",
                                      data: initialData
                                    }
                                  });
                                }}
                              >
                                {item.code || "-"}
                              </span>
                            ))}
                          </div>
                          <div
                            style={poReferenceTableCellStyle({
                              alignItems: "flex-start",
                              padding: "12px 0",
                              flexDirection: "column",
                              gap: "10px",
                            })}
                          >
                            {(log.items || []).map((item, itemIndex) => (
                              <span
                                key={`${log.id}-qty-${item.id || itemIndex}`}
                                style={{
                                  fontSize: "var(--text-title-3)",
                                  lineHeight: "20px",
                                  letterSpacing: "0.09625px",
                                  color: "var(--neutral-on-surface-primary)",
                                }}
                              >
                                {item.receivedNow || 0} pcs
                              </span>
                            ))}
                          </div>
                          <div
                            style={poReferenceTableCellStyle({
                              alignItems: "flex-start",
                              padding: "12px 0",
                            })}
                          >
                            {log.receivedBy || "-"}
                          </div>
                          <div
                            style={poReferenceTableCellStyle({
                              alignItems: "flex-start",
                              padding: "12px 0",
                              width: "100%",
                              overflow: "hidden",
                            })}
                          >
                            <Tooltip content={log.notes || "-"} position="top">
                              <span
                                style={{
                                  display: "block",
                                  width: "100%",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  fontSize: "var(--text-title-3)",
                                  color: "var(--neutral-on-surface-primary)",
                                }}
                              >
                                {log.notes || "-"}
                              </span>
                            </Tooltip>
                          </div>
                          <div
                            style={poReferenceTableCellStyle({
                              alignItems: "flex-start",
                              padding: "12px 0",
                            })}
                          >
                            <ProofDocumentList
                              documents={
                                log.proofDocuments ||
                                log.attachments ||
                                normalizeProofDocuments([], log.proof)
                              }
                              onDocumentClick={(doc) => {
                                setDocumentToastMessage(
                                  `${doc?.name || "Document"} opened`
                                );
                                setShowDocumentToast(true);
                                setTimeout(
                                  () => setShowDocumentToast(false),
                                  4000
                                );
                              }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={poReferenceTableEmptyStateStyle}>
                        No receipt history yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === "logs" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {approvalEnabled ? (
            <div
              style={{
                background: "var(--neutral-surface-primary)",
                borderRadius: "16px",
                border: "1px solid var(--neutral-line-separator-1)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "24px 24px 0 24px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--text-title-2)",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--neutral-on-surface-primary)",
                  }}
                >
                  Approval Logs
                </span>
              </div>
              <div style={{ padding: "24px" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "24px",
                    marginBottom: "28px",
                  }}
                >
                  <LabelValue label="Requested By" value={requestedBy} />
                  <LabelValue label="Requested At" value={requestedAt} />
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div
                    style={{
                      display: "flex",
                      paddingBottom: "12px",
                      borderBottom: "1px solid var(--neutral-line-separator-1)",
                      fontWeight: "var(--font-weight-bold)",
                      fontSize: "var(--text-title-3)",
                      color: "var(--neutral-on-surface-primary)",
                    }}
                  >
                    <div style={{ flex: "1.1" }}>Approvers</div>
                    <div style={{ width: "140px" }}>Status</div>
                    <div style={{ flex: "2.4" }}>Comments</div>
                  </div>
                  {approverList.map((approver, idx) => {
                    const rowStatus = getApprovalRowStatus();
                    const showApproved =
                      currentStatus === "Issued" ||
                      currentStatus === "Completed";
                    const showRejected = currentStatus === "Canceled";
                    const showPending = !showApproved && !showRejected;
                    const thisStatus =
                      idx === 0
                        ? rowStatus
                        : { text: "Pending", variant: "grey-light" };
                    const thisComment =
                      idx === 0 ? getApprovalRowComment() : "-";
                    return (
                      <div
                        key={approver.id || idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "18px 0 10px 0",
                          fontSize: "var(--text-title-3)",
                          borderBottom:
                            idx === approverList.length - 1
                              ? "none"
                              : "1px solid var(--neutral-line-separator-1)",
                        }}
                      >
                        <div
                          style={{
                            flex: "1.1",
                            color: "var(--neutral-on-surface-primary)",
                          }}
                        >
                          {approver.name}
                        </div>
                        <div style={{ width: "140px" }}>
                          <StatusBadge variant={thisStatus.variant}>
                            {thisStatus.text}
                          </StatusBadge>
                        </div>
                        <div
                          style={{
                            flex: "2.4",
                            color: "var(--neutral-on-surface-secondary)",
                            lineHeight: "1.5",
                          }}
                        >
                          {thisComment}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          <div
            style={{
              background: "var(--neutral-surface-primary)",
              borderRadius: "16px",
              border: "1px solid var(--neutral-line-separator-1)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "24px 24px 0 24px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "var(--text-title-2)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--neutral-on-surface-primary)",
                }}
              >
                Activity Logs
              </span>
            </div>
            <div style={{ padding: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    display: "flex",
                    paddingBottom: "12px",
                    borderBottom: "1px solid var(--neutral-line-separator-1)",
                    fontWeight: "var(--font-weight-bold)",
                    fontSize: "var(--text-title-3)",
                    color: "var(--neutral-on-surface-primary)",
                  }}
                >
                  <div style={{ flex: "1.1" }}>Name</div>
                  <div style={{ flex: "1.9" }}>Email</div>
                  <div style={{ flex: "2.8" }}>Activity</div>
                  <div style={{ width: "190px" }}>Timestamp</div>
                </div>

                {dynamicActivityLogs.map((log, idx, arr) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      padding: "16px 0",
                      borderBottom:
                        idx === arr.length - 1
                          ? "none"
                          : "1px solid var(--neutral-line-separator-1)",
                      fontSize: "var(--text-title-3)",
                    }}
                  >
                    <div
                      style={{
                        flex: "1.1",
                        color: "var(--neutral-on-surface-primary)",
                      }}
                    >
                      {log.name}
                    </div>
                    <div
                      style={{
                        flex: "1.9",
                        color: "var(--neutral-on-surface-primary)",
                      }}
                    >
                      {log.email}
                    </div>
                    <div
                      style={{
                        flex: "2.8",
                        display: "flex",
                        flexDirection: "column",
                        gap: log.desc ? "6px" : "0",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: "var(--font-weight-bold)",
                          color: "var(--neutral-on-surface-primary)",
                        }}
                      >
                        {log.title}
                      </span>
                      {log.desc ? (
                        <span
                          style={{
                            color: "var(--neutral-on-surface-secondary)",
                            lineHeight: "1.5",
                          }}
                        >
                          {log.desc}
                        </span>
                      ) : null}
                    </div>
                    <div
                      style={{
                        width: "190px",
                        color: "var(--neutral-on-surface-secondary)",
                      }}
                    >
                      {log.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Card
          style={{
            padding: "32px",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "260px",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-title-2)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--neutral-on-surface-primary)",
            }}
          >
            {activeTab === "receipt" ? "Receipt" : "Documents"}
          </span>
          <span
            style={{
              fontSize: "var(--text-title-3)",
              color: "var(--neutral-on-surface-secondary)",
            }}
          >
            Content for this tab will be added next.
          </span>
        </Card>
      )}

      {showFooterSubmit || showFooterApprovalActions || showFooterIssuedCancel ? (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: isSidebarCollapsed ? "82px" : "286px",
            transition: "left 0.2s ease",
            right: 0,
            background: "var(--neutral-surface-primary)",
            borderTop: "1px solid var(--neutral-line-separator-1)",
            padding: "12px 24px",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            zIndex: 100,
          }}
        >
          <div style={{ display: "flex", gap: "16px" }}>
            {showFooterSubmit ? (
              <Button
                size="medium"
                variant="filled"
                onClick={handleDetailSubmitClick}
              >
                Submit PO
              </Button>
            ) : null}
            {showFooterApprovalActions ? (
              <>
                <Button
                  size="medium"
                  variant="danger"
                  onClick={() => openDecisionModal("cancel")}
                >
                  Cancel PO
                </Button>
                <Button
                  size="medium"
                  variant="outlined"
                  onClick={() => openDecisionModal("revision")}
                >
                  Ask for Revision
                </Button>
                <Button
                  size="medium"
                  variant="filled"
                  onClick={() => openDecisionModal("approve")}
                >
                  Approve
                </Button>
              </>
            ) : null}
            {showFooterIssuedCancel ? (
              <Button
                size="medium"
                variant="danger"
                onClick={() => openDecisionModal("cancel")}
              >
                Cancel PO
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      <GeneralModal
        isOpen={showSubmitGuardModal}
        onClose={() => setShowSubmitGuardModal(false)}
        title="Complete Required Information"
        description="Please fill in the required information below before submitting this purchase order."
        width="440px"
        footer={
          <Button
            variant="filled"
            size="large"
            style={{ width: "100%" }}
            onClick={() => setShowSubmitGuardModal(false)}
          >
            Okay
          </Button>
        }
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            background: "var(--neutral-surface-grey-lighter)",
            borderRadius: "12px",
            padding: "16px",
          }}
        >
          {validateDetailRequiredInfo().map((item) => (
            <div
              key={item}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "var(--text-title-3)",
                color: "var(--neutral-on-surface-primary)",
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--status-red-primary)",
                  flexShrink: 0,
                }}
              />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </GeneralModal>

      <GeneralModal
        isOpen={showDetailSubmitConfirmModal}
        onClose={() => setShowDetailSubmitConfirmModal(false)}
        title="Submit PO?"
        width="376px"
        description={
          poApprovalSettings?.isApprovalActive
            ? "This PO will be submitted for approval."
            : "This PO will be automatically approved upon submission."
        }
        footer={
          <>
            <Button
              size="large"
              style={{ width: "100%" }}
              onClick={handleConfirmDetailSubmit}
            >
                          Yes, Submit
            </Button>
            <Button
              variant="outlined"
              size="large"
              style={{ width: "100%" }}
              onClick={() => setShowDetailSubmitConfirmModal(false)}
            >
              Cancel
            </Button>
          </>
        }
      />

      <GeneralModal
        isOpen={showUploadDocumentModal}
        onClose={() => {
          setShowUploadDocumentModal(false);
          resetDocumentUploadState();
        }}
        title="Upload Document"
        width="640px"
        footer={
          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
            <Button
              variant="outlined"
              size="large"
              style={{ flex: 1 }}
              onClick={() => {
                setShowUploadDocumentModal(false);
                resetDocumentUploadState();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="filled"
              size="large"
              style={{ flex: 1 }}
              disabled={
                !documentUploadDocumentType || !documentUploadFileObject
              }
              onClick={handleUploadDocument}
            >
              Upload
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "8px" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2px",
                fontSize: "var(--text-body)",
                fontWeight: "var(--font-weight-regular)",
              }}
            >
              <span style={{ color: "var(--status-red-primary)" }}>*</span>
              <span style={{ color: "var(--neutral-on-surface-primary)" }}>
                Document Type
              </span>
            </div>
            <DropdownSelect
              value={documentUploadDocumentType}
              onChange={(nextValue) => setDocumentUploadDocumentType(nextValue)}
              options={[
                { value: "invoice", label: "Invoice" },
                { value: "delivery_note", label: "Delivery Note" },
                { value: "packing_list", label: "Packing List" },
                { value: "quotation_vendor", label: "Quotation (Vendor)" },
                {
                  value: "contract_agreement",
                  label: "Contract / Agreement",
                },
                { value: "other", label: "Other" },
              ]}
              borderRadius="12px"
            />
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "8px" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2px",
                fontSize: "var(--text-body)",
                fontWeight: "var(--font-weight-regular)",
              }}
            >
              <span style={{ color: "var(--status-red-primary)" }}>*</span>
              <span style={{ color: "var(--neutral-on-surface-primary)" }}>
                Document Upload
              </span>
            </div>
            <UploadDropzone
              onFilesSelected={handleDocumentUploadFileSelection}
              maxFiles={1}
              disabled={!!documentUploadFileObject}
            />
          </div>

          {documentUploadFileObject ? (
            <UploadDescriptionCard
              file={documentUploadCardFile}
              onRemove={resetDocumentUploadState}
              onDescriptionChange={setDocumentUploadDescription}
            />
          ) : null}
        </div>
      </GeneralModal>

      <GeneralModal
        isOpen={showAdjustWoModal}
        onClose={() => setShowAdjustWoModal(false)}
        title="Adjust Related Work Order?"
        width="480px"
        footer={
          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
            <Button
              variant="outlined"
              size="large"
              style={{ flex: 1 }}
              onClick={() => setShowAdjustWoModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="filled"
              size="large"
              style={{ flex: 1 }}
              onClick={handleContinueFromAdjustWo}
            >
              Continue
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", textAlign: "center" }}>
          <span
            style={{
              fontSize: "var(--text-title-3)",
              fontWeight: "var(--font-weight-regular)",
              color: "var(--neutral-on-surface-secondary)",
              lineHeight: "24px",
            }}
          >
            The related work order does not yet reflect the quantity required for this receipt. If you continue, the system will automatically update the routing quantity to match this receipt.
          </span>
        </div>
      </GeneralModal>

      <GeneralModal
        isOpen={showConfirmReceiptModal}
        onClose={() => {
          setShowConfirmReceiptModal(false);
          setReceiptProofDocuments([]);
          setReceiptProofUploadError("");
          setReceiptProofDescriptionErrors({});
          setReceiptNotes("");
        }}
        title="Confirm Receipt"
        width="680px"
        footer={
          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
            <Button
              variant="outlined"
              size="large"
              style={{ flex: 1 }}
              onClick={() => {
                setShowConfirmReceiptModal(false);
                setReceiptProofDocuments([]);
                setReceiptProofUploadError("");
                setReceiptProofDescriptionErrors({});
                setReceiptNotes("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="filled"
              size="large"
              style={{ flex: 1 }}
              disabled={
                receiptProofDocuments.length === 0 ||
                !receiptReceivedBy.trim() ||
                receiptProofDocuments.some(
                  (doc) => !(doc.description || "").trim()
                )
              }
              onClick={handleSubmitReceipt}
            >
              Submit
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {showAutoAdjustWoMessage && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "12px 16px",
                borderRadius: "8px",
                background: "var(--feature-brand-container-darker)",
                border: "1px solid var(--feature-brand-container-darker)",
              }}
            >
              <Info
                size={16}
                strokeWidth={2.1}
                color="var(--feature-brand-primary)"
                style={{ flexShrink: 0, marginTop: "2px" }}
              />
              <span
                style={{
                  fontSize: "var(--text-title-3)",
                  fontWeight: "var(--font-weight-regular)",
                  color: "var(--neutral-on-surface-primary)",
                  lineHeight: "20px",
                }}
              >
                The related work order will be automatically updated to match this receipt.
              </span>
            </div>
          )}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "8px" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2px",
                fontSize: "var(--text-body)",
                fontWeight: "var(--font-weight-regular)",
              }}
            >
              <span style={{ color: "var(--status-red-primary)" }}>*</span>
              <span style={{ color: "var(--neutral-on-surface-primary)" }}>
                Received By
              </span>
            </div>
            <input
              type="text"
              value={receiptReceivedBy}
              onChange={(e) => setReceiptReceivedBy(e.target.value)}
              placeholder="Enter receiver name"
              style={{
                height: "48px",
                border: "1px solid var(--neutral-line-separator-1)",
                borderRadius: "8px",
                padding: "0 16px",
                background: "var(--neutral-surface-primary)",
                fontSize: "var(--text-subtitle-1)",
                color: "var(--neutral-on-surface-primary)",
                width: "100%",
                outline: "none",
                fontFamily: "Lato, sans-serif",
              }}
            />
          </div>
          <InputField
            label="Notes"
            multiline
            placeholder="Add note for this receipt"
            value={receiptNotes}
            onChange={(e) => setReceiptNotes(e.target.value)}
          />
          <div
            style={{ display: "flex", flexDirection: "column", gap: "8px" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2px",
                fontSize: "var(--text-body)",
                fontWeight: "var(--font-weight-regular)",
              }}
            >
              <span style={{ color: "var(--status-red-primary)" }}>*</span>
              <span style={{ color: "var(--neutral-on-surface-primary)" }}>
                Upload Proof Document
              </span>
            </div>
            <UploadDropzone
              maxFiles={MAX_PROOF_UPLOAD_FILES}
              multiple
              disabled={receiptProofDocuments.length >= MAX_PROOF_UPLOAD_FILES}
              error={receiptProofUploadError}
              onFilesSelected={handleReceiptProofFilesSelected}
            />
            {receiptProofDocuments.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {receiptProofDocuments.map((doc) => (
                  <UploadDescriptionCard
                    key={doc.id}
                    file={doc}
                    descriptionRequired
                    descriptionError={receiptProofDescriptionErrors[doc.id]}
                    onDescriptionChange={(value) =>
                      updateReceiptProofDescription(doc.id, value)
                    }
                    onRemove={() => removeReceiptProofDocument(doc.id)}
                  />
                ))}
              </div>
            )}
            {receiptProofUploadError && (
              <span
                style={{
                  fontSize: "var(--text-body)",
                  color: "var(--status-red-primary)",
                }}
              >
                {receiptProofUploadError}
              </span>
            )}
          </div>
        </div>
      </GeneralModal>

      <GeneralModal
        isOpen={showRenameDocumentModal}
        onClose={() => {
        setShowRenameDocumentModal(false);
        setSelectedDocumentId(null);
        setRenameDocumentValue("");
        setEditDocumentDescriptionValue("");
        setEditDocumentTypeValue("other");
      }}
      title="Edit Document"
      width="640px"
      footer={
        <div style={{ display: "flex", gap: "12px", width: "100%" }}>
          <Button
            variant="outlined"
              size="large"
              style={{ flex: 1 }}
              onClick={() => {
                setShowRenameDocumentModal(false);
                setSelectedDocumentId(null);
                setRenameDocumentValue("");
                setEditDocumentDescriptionValue("");
                setEditDocumentTypeValue("other");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="filled"
              size="large"
              style={{ flex: 1 }}
              disabled={!renameDocumentValue.trim()}
              onClick={handleConfirmRenameDocument}
            >
              Save
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <InputField
            label="Document Name"
            value={renameDocumentValue}
            onChange={(e) => setRenameDocumentValue(e.target.value)}
            placeholder="Enter document name"
          />
          <InputField
            label="File Description"
            value={editDocumentDescriptionValue}
            onChange={(e) => setEditDocumentDescriptionValue(e.target.value)}
            placeholder="Enter File Description"
            maxLength={FILE_DESCRIPTION_MAX_LENGTH}
            headerRight={`${editDocumentDescriptionValue.length}/${FILE_DESCRIPTION_MAX_LENGTH}`}
          />
          <div
            style={{ display: "flex", flexDirection: "column", gap: "8px" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2px",
                fontSize: "var(--text-body)",
                fontWeight: "var(--font-weight-regular)",
              }}
            >
              <span style={{ color: "var(--status-red-primary)" }}>*</span>
              <span style={{ color: "var(--neutral-on-surface-primary)" }}>
                Document Type
              </span>
            </div>
            <DropdownSelect
              value={editDocumentTypeValue}
              onChange={(nextValue) => setEditDocumentTypeValue(nextValue)}
              options={[
                { value: "invoice", label: "Invoice" },
                { value: "delivery_note", label: "Delivery Note" },
                { value: "packing_list", label: "Packing List" },
                { value: "quotation_vendor", label: "Quotation (Vendor)" },
                {
                  value: "contract_agreement",
                  label: "Contract / Agreement",
                },
                { value: "other", label: "Other" },
              ]}
              borderRadius="12px"
            />
          </div>
        </div>
      </GeneralModal>

      <GeneralModal
        isOpen={showDeleteDocumentModal}
        onClose={() => {
          setShowDeleteDocumentModal(false);
          setSelectedDocumentId(null);
          setRenameDocumentValue("");
        }}
        title="Delete Document?"
        width="376px"
        centeredHeader
        description="This document will be permanently removed from the purchase order."
        footer={
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
            <Button
              variant="filled"
              size="large"
              style={{ width: "100%" }}
              onClick={handleConfirmDeleteDocument}
            >
              Yes, Delete
            </Button>
            <Button
              variant="outlined"
              size="large"
              style={{ width: "100%" }}
              onClick={() => {
                setShowDeleteDocumentModal(false);
                setSelectedDocumentId(null);
                setRenameDocumentValue("");
              }}
            >
              Cancel
            </Button>
          </div>
        }
      />

      <GeneralModal
        isOpen={isDecisionModalOpen}
        onClose={() => {
          setIsDecisionModalOpen(false);
          setDecisionError("");
        }}
        title={getDecisionMeta().title}
        width="440px"
        footer={
          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
            <Button
              variant="outlined"
              size="large"
              style={{ flex: 1 }}
              onClick={() => {
                setIsDecisionModalOpen(false);
                setDecisionError("");
              }}
            >
              Back
            </Button>
            <Button
              variant="filled"
              size="large"
              style={{ flex: 1 }}
              onClick={handleSubmitDecision}
            >
              Submit
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {getDecisionMeta().mandatory && (
                  <span
                    style={{
                      color: "var(--status-red-primary)",
                      fontSize: "var(--text-body)",
                    }}
                  >
                    *
                  </span>
                )}
                <span
                  style={{
                    fontSize: "var(--text-title-3)",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--neutral-on-surface-primary)",
                  }}
                >
                  Comment
                </span>
              </div>
              <span
                style={{
                  fontSize: "var(--text-desc)",
                  color: "var(--neutral-on-surface-tertiary)",
                }}
              >
                {decisionComment.length}/400
              </span>
            </div>
            <textarea
              value={decisionComment}
              maxLength={400}
              onChange={(e) => {
                setDecisionComment(e.target.value);
                if (decisionError) setDecisionError("");
              }}
              placeholder={getDecisionMeta().helper}
              style={{
                minHeight: "120px",
                border: decisionError
                  ? "1px solid var(--status-red-primary)"
                  : "1px solid var(--neutral-line-separator-2)",
                borderRadius: "12px",
                padding: "12px 16px",
                background: "var(--neutral-surface-primary)",
                fontSize: "var(--text-subtitle-1)",
                color: "var(--neutral-on-surface-primary)",
                width: "100%",
                outline: "none",
                fontFamily: "Lato, sans-serif",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
            {decisionError && (
              <span
                style={{
                  fontSize: "var(--text-body)",
                  color: "var(--status-red-primary)",
                }}
              >
                {decisionError}
              </span>
            )}
          </div>
        </div>
      </GeneralModal>
    </div>
  );
};
