import { useEffect, useMemo, useRef, useState } from "react";
import { DataTable, type DataTablePageEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { OverlayPanel } from "primereact/overlaypanel";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

import type { Artwork } from "../types/artwork";
import { fetchArtworks } from "../api/artworks";

export default function ArtworkTable() {
  const [rows, setRows] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0); // 0-based for table
  const [rowsPerPage] = useState(12);
  const [totalRecords, setTotalRecords] = useState(0);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectCount, setSelectCount] = useState("");

  const overlayRef = useRef<OverlayPanel>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchArtworks(page + 1);
        if (cancelled) return;

        setRows(res.data);
        setTotalRecords(res.pagination.total);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [page]);

  const selectedRowsOnPage = useMemo(() => {
    return rows.filter((r) => selectedIds.has(r.id));
  }, [rows, selectedIds]);

  const updateSelectionForPage = (selectedOnThisPage: Artwork[]) => {
    const pageIds = new Set(rows.map((r) => r.id));
    const next = new Set(selectedIds);

    // remove current page ids
    pageIds.forEach((id) => next.delete(id));

    // add selected ids from current page
    selectedOnThisPage.forEach((r) => next.add(r.id));

    setSelectedIds(next);
  };

  const onSelectionChange = (value: Artwork[]) => {
    updateSelectionForPage(value);
  };

  const onPageChange = (event: DataTablePageEvent) => {
    setPage(event.page ?? 0);
  };

  const handleCustomSelect = () => {
    const n = parseInt(selectCount, 10);

    if (Number.isNaN(n) || n <= 0) {
      alert("Enter a valid number");
      return;
    }

    const max = rows.length;
    const take = Math.min(n, max);

    const nextSelected = rows.slice(0, take);
    updateSelectionForPage(nextSelected);

    overlayRef.current?.hide();
    setSelectCount("");
  };

  const textCell = (value: unknown) => {
    const v = String(value ?? "").trim();
    return v.length ? v : "-";
  };

  return (
    <div className="p-4">
      <div className="flex justify-content-between align-items-center mb-3">
        <div className="text-xl font-semibold">Artworks</div>

        <div className="flex align-items-center gap-2">
          <div className="text-sm">
            Selected: <b>{selectedIds.size}</b>
          </div>

          <Button
            label="Select N"
            icon="pi pi-check-square"
            onClick={(e) => overlayRef.current?.toggle(e)}
            size="small"
          />
        </div>

        <OverlayPanel ref={overlayRef} style={{ width: 280 }}>
          <div className="flex flex-column gap-2">
            <label className="text-sm font-medium">Select first N rows (this page)</label>
            <InputText
              value={selectCount}
              onChange={(e) => setSelectCount(e.target.value)}
              placeholder="e.g. 5"
            />
            <Button label="Apply" onClick={handleCustomSelect} size="small" />
          </div>
        </OverlayPanel>
      </div>

      <DataTable
        value={rows}
        dataKey="id"
        lazy
        paginator
        first={page * rowsPerPage}
        rows={rowsPerPage}
        totalRecords={totalRecords}
        loading={loading}
        onPage={onPageChange}
        selection={selectedRowsOnPage}
        onSelectionChange={(e) => onSelectionChange(e.value as Artwork[])}
        selectionMode="checkbox"
        showGridlines
        stripedRows
        size="small"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />

        <Column field="title" header="Title" body={(r: Artwork) => textCell(r.title)} />
        <Column
          field="place_of_origin"
          header="Place of Origin"
          body={(r: Artwork) => textCell(r.place_of_origin)}
        />
        <Column
          field="artist_display"
          header="Artist"
          body={(r: Artwork) => textCell(r.artist_display)}
        />
        <Column
          field="inscriptions"
          header="Inscriptions"
          body={(r: Artwork) => textCell(r.inscriptions)}
        />
        <Column
          field="date_start"
          header="Date Start"
          body={(r: Artwork) => textCell(r.date_start)}
        />
        <Column
          field="date_end"
          header="Date End"
          body={(r: Artwork) => textCell(r.date_end)}
        />
      </DataTable>
    </div>
  );
}
